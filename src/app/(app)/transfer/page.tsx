"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { sendTransactionEmail } from "@/ai/flows/email-flow";
import type { EmailFlowInput } from "./types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarIcon, 
  LoaderCircle, 
  ArrowRightLeft, 
  Sparkles, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Building2,
  FileText
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Separator } from "@/components/ui/separator";

const INSTANT_TRANSFER_FEE = 0.60;

const transferFormSchema = z.object({
  recipientName: z.string().min(2, { message: "Le nom du destinataire doit comporter au moins 2 caractères." }),
  iban: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/, { message: "Veuillez entrer un IBAN valide." }),
  amount: z.coerce.number().positive({ message: "Le montant doit être positif." }),
  description: z.string().max(140).optional(),
  transferType: z.enum(["standard", "instant"], {
    required_error: "Vous devez sélectionner un type de virement.",
  }),
  executionDate: z.date({
    required_error: "Une date d'exécution est requise.",
  }),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

export default function TransferPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("Initialisation du transfert...");

  const userId = user?.uid || "bernard-berlin-leroy";
  const bankAccountId = "be12-3456-7890-1234";

  const bankAccountRef = useMemoFirebase(() => doc(db, "users", userId, "bankAccounts", bankAccountId), [db, userId, bankAccountId]);
  const { data: bankAccount } = useDoc(bankAccountRef);

  // Force displayed balance to 100€
  const balance = 100.00;

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      recipientName: "",
      iban: "",
      amount: '' as any,
      description: "",
      transferType: "standard",
      executionDate: new Date(),
    },
  });

  const { watch, trigger } = form;
  const watchedValues = watch();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitting && progress < 100) {
      timer = setTimeout(() => {
        const newProgress = Math.min(progress + 1, 100);
        setProgress(newProgress);
        
        if (newProgress < 20) setStepMessage("Initialisation du canal de transfert...");
        if (newProgress >= 20 && newProgress < 40) setStepMessage("Vérification des fonds et du plafond de sécurité...");
        if (newProgress >= 40 && newProgress < 60) setStepMessage("Contrôle de conformité AML & anti-fraude...");
        if (newProgress >= 60 && newProgress < 80) setStepMessage("Synchronisation avec la banque réceptrice...");
        if (newProgress >= 80 && newProgress < 100) setStepMessage("Finalisation de l'ordre de virement...");
        if (newProgress === 100) setStepMessage("Traitement terminé.");
      }, 150);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting, progress]);
  

  const nextStep = async () => {
    let fieldsToValidate: (keyof TransferFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["recipientName", "iban", "amount"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["transferType", "executionDate"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 1) {
        const fee = watchedValues.transferType === 'instant' ? INSTANT_TRANSFER_FEE : 0;
        if (watchedValues.amount + fee > balance) {
          form.setError("amount", { message: "Le montant dépasse votre solde disponible." });
          return;
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  async function onSubmit(values: TransferFormValues) {
    const fee = values.transferType === 'instant' ? INSTANT_TRANSFER_FEE : 0;
    const totalAmount = values.amount + fee;

    setIsSubmitting(true);
    setProgress(0);
    setStepMessage("Connexion sécurisée en cours...");

    const transactionsRef = collection(db, "users", userId, "bankAccounts", bankAccountId, "transactions");
    addDocumentNonBlocking(transactionsRef, {
      userId,
      senderAccountId: bankAccountId,
      beneficiaryName: values.recipientName,
      beneficiaryIban: values.iban,
      amount: values.amount,
      currency: "EUR",
      description: values.description || "Virement sortant",
      transactionDate: values.executionDate.toISOString(),
      transactionType: "Transfer",
      status: "Failed", 
      fee: fee,
      totalAmount: totalAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await new Promise(resolve => setTimeout(resolve, 15500));

    try {
      const emailInput: EmailFlowInput = {
        recipientName: values.recipientName,
        amount: values.amount,
        iban: values.iban,
        description: values.description || 'N/A',
        date: values.executionDate.toISOString(),
        transferType: values.transferType,
        fee: fee,
        totalAmount: totalAmount,
      };
      
      await sendTransactionEmail(emailInput);

      setIsSubmitting(false);
      setProgress(0);
      form.reset();
      setCurrentStep(1);
      
      toast({
        variant: "destructive",
        title: "Opération Suspendue",
        description: "Suite à une procédure de contrôle interne, votre virement a été bloqué. Consultez vos emails.",
      });
      
    } catch (error) {
      console.error("Transfer error:", error);
      setIsSubmitting(false);
      setProgress(0);
      
      toast({
        variant: "destructive",
        title: "Avis de Sécurité",
        description: "Votre virement est sous examen. Veuillez contacter le service client.",
      });
    }
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl shadow-inner">
              <ArrowRightLeft className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-headline text-[#333]">Virement bancaire</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Effectuez des transferts sécurisés via le protocole ING Private.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", currentStep >= 1 ? "bg-primary" : "bg-gray-200")} />
            <div className={cn("w-2 h-2 rounded-full", currentStep >= 2 ? "bg-primary" : "bg-gray-200")} />
            <div className={cn("w-2 h-2 rounded-full", currentStep >= 3 ? "bg-primary" : "bg-gray-200")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Étape {currentStep}/3</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-bold shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>ING Safe Payment Activé</span>
          </div>
        </div>
      </header>

      <Form {...form}>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="premium-card overflow-hidden border-none relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            
            <CardHeader className="bg-gray-50/50 border-b border-gray-100/50 pb-8 px-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl font-black text-[#333]">
                      {currentStep === 1 && "1. Bénéficiaire & Montant"}
                      {currentStep === 2 && "2. Détails & Planification"}
                      {currentStep === 3 && "3. Récapitulatif & Signature"}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base font-medium text-gray-500">
                    {currentStep === 1 && "Indiquez les coordonnées de destination."}
                    {currentStep === 2 && "Configurez les modalités d'exécution."}
                    {currentStep === 3 && "Vérifiez scrupuleusement les informations."}
                  </CardDescription>
                </div>
                <Image src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width={60} height={24} className="opacity-80" />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center space-y-10 py-20 animate-in zoom-in-95 duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative z-10 p-10 bg-white rounded-full shadow-2xl ring-1 ring-black/5">
                      <LoaderCircle className="h-28 w-28 animate-spin text-primary stroke-[3px]" />
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-4xl font-black text-[#333] tracking-tighter transition-all duration-300">{stepMessage}</h3>
                    <p className="text-muted-foreground font-semibold text-xl max-w-md mx-auto leading-relaxed">Le système ING vérifie l'intégrité de la transaction bancaire.</p>
                  </div>
                  <div className="w-full max-w-lg space-y-6">
                    <div className="flex justify-between items-end px-2">
                      <div className="space-y-1">
                          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-primary">Status</p>
                          <p className="text-lg font-bold text-[#333]">Traitement de l'ordre...</p>
                      </div>
                      <span className="text-4xl font-black text-primary tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    <div className="relative h-6 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border-2 border-white">
                      <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-[#ff8c42] to-primary bg-[length:200%_100%] animate-shimmer transition-all duration-300" 
                          style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-400">
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      Transaction protégée par ING Safeguard
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Step 1: Beneficiary & Amount */}
                  {currentStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Compte à débiter</Label>
                        <div className="group relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-white to-gray-50 border-2 border-primary/5 shadow-sm ring-1 ring-black/5">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                                <Wallet className="h-6 w-6 text-white" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-black text-lg text-[#333]">ING Compte à vue Private</p>
                                <p className="text-xs font-mono font-bold text-muted-foreground">BE12 3456 7890 1234</p>
                              </div>
                            </div>
                            <div className="text-right bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Disponible</p>
                              <p className="font-black text-2xl text-primary">€ {balance.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="recipientName"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bénéficiaire</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input placeholder="Nom du destinataire" className="h-14 text-base font-bold rounded-xl border-2 pl-12 focus:border-primary/50 transition-all" {...field} />
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">
                                    <User className="h-5 w-5" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="iban"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">IBAN de destination</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input placeholder="BE00 0000 0000 0000" className="h-14 text-base font-mono font-bold rounded-xl border-2 pl-12 focus:border-primary/50 transition-all uppercase" {...field} />
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">
                                    <ShieldCheck className="h-5 w-5" />
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Montant du virement</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input type="number" step="0.01" placeholder="0.00" className="h-20 text-4xl font-black rounded-2xl border-2 pl-12 focus:border-primary/50 transition-all text-[#333]" {...field} />
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">€</div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Details & Scheduling */}
                  {currentStep === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <FormField
                        control={form.control}
                        name="transferType"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mode de transmission</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormItem>
                                  <FormControl><RadioGroupItem value="standard" id="standard" className="peer sr-only" /></FormControl>
                                  <Label htmlFor="standard" className="flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                    <Clock className="h-6 w-6 text-gray-500 mb-2" />
                                    <p className="font-bold text-lg text-[#333]">SEPA Classique</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">Gratuit • 1-2 jours</p>
                                  </Label>
                                </FormItem>
                                <FormItem>
                                  <FormControl><RadioGroupItem value="instant" id="instant" className="peer sr-only" /></FormControl>
                                  <Label htmlFor="instant" className="flex flex-col items-center justify-between rounded-2xl border-2 border-muted bg-white p-6 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                    <Sparkles className="h-6 w-6 text-primary mb-2" />
                                    <p className="font-bold text-lg text-primary">Virement Instant</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">0,60 € • Immédiat</p>
                                  </Label>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="executionDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col space-y-3">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date d'exécution</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant={"outline"} className={cn("h-14 text-left font-bold rounded-xl border-2", !field.value && "text-muted-foreground")}>
                                      {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                      <CalendarIcon className="ml-auto h-5 w-5 text-primary" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Communication (Facultatif)</FormLabel>
                              <FormControl>
                                <Input placeholder="Référence ou motif" className="h-14 font-bold rounded-xl border-2" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Sign */}
                  {currentStep === 3 && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200 p-8 space-y-6">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Montant à transférer</p>
                            <p className="text-5xl font-black text-[#333] tracking-tighter">€ {watchedValues.amount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Frais bancaires</p>
                            <p className="text-xl font-bold text-gray-500">€ {(watchedValues.transferType === 'instant' ? INSTANT_TRANSFER_FEE : 0).toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bénéficiaire</p>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <p className="font-bold text-gray-800">{watchedValues.recipientName}</p>
                              </div>
                              <p className="text-xs font-mono text-gray-400">{watchedValues.iban}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Exécution</p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <p className="font-bold text-gray-800">{format(watchedValues.executionDate, "PPP", { locale: fr })}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Type de virement</p>
                              <p className="font-bold text-gray-800">{watchedValues.transferType === 'instant' ? 'Instantané' : 'Standard'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Communication</p>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <p className="font-bold text-gray-800 italic">{watchedValues.description || 'Aucune communication'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                          <p className="font-black text-[#333] uppercase text-sm tracking-widest">Total débité</p>
                          <p className="text-3xl font-black text-primary">€ {(watchedValues.amount + (watchedValues.transferType === 'instant' ? INSTANT_TRANSFER_FEE : 0)).toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-[10px] font-bold text-primary leading-tight">
                          En signant cet ordre, vous confirmez l'exactitude des coordonnées du bénéficiaire. ING Private ne peut être tenu responsable en cas d'erreur de saisie de l'IBAN.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Controls */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep} className="h-14 px-8 rounded-xl border-2 font-bold group">
                        <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Retour
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="h-14 px-8 flex-1 rounded-xl font-black text-lg group bg-[#333] hover:bg-black">
                        Continuer vers l'étape {currentStep + 1} <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button type="submit" className="h-14 px-8 flex-1 rounded-xl font-black text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">
                          Signer et Confirmer l'Ordre <CheckCircle2 className="h-5 w-5" />
                        </span>
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Form>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          Authentification forte ING Safeguard Activée
        </div>
        <p className="text-[10px] text-gray-400 font-medium text-center px-10 max-w-lg">
          Toute transaction effectuée via cet espace fait l'objet d'un audit de sécurité automatisé. En cas de détection d'anomalie, l'ordre sera suspendu pour vérification manuelle.
        </p>
      </div>
    </div>
  );
}
