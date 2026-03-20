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
import { CalendarIcon, LoaderCircle, ArrowRightLeft, Sparkles, Wallet, ShieldCheck, Info, CheckCircle2, User, AlertTriangle, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

export default function TransferPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("Initialisation du transfert...");

  const userId = user?.uid || "bernard-berlin-leroy";
  const bankAccountId = "be12-3456-7890-1234";

  const bankAccountRef = useMemoFirebase(() => doc(db, "users", userId, "bankAccounts", bankAccountId), [db, userId, bankAccountId]);
  const { data: bankAccount } = useDoc(bankAccountRef);

  // Use || 100.00 to force the display of 100€ even if Firestore data is 0 or loading
  const balance = bankAccount?.balance || 100.00;

  const form = useForm<z.infer<typeof transferFormSchema>>({
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
  

  async function onSubmit(values: z.infer<typeof transferFormSchema>) {
    const fee = values.transferType === 'instant' ? INSTANT_TRANSFER_FEE : 0;
    const totalAmount = values.amount + fee;

    if (totalAmount > balance) {
      form.setError("amount", { message: "Le montant dépasse votre solde disponible." });
      return;
    }

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
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-bold shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>ING Safe Payment Activé</span>
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
                                  <CardTitle className="text-2xl font-black text-[#333]">Ordre de Virement Premium</CardTitle>
                                </div>
                                <CardDescription className="text-base font-medium text-gray-500">Transferts protégés par chiffrement de bout en bout.</CardDescription>
                            </div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hidden sm:block">
                                <Image src="https://i.imgur.com/WWZ10oQ.png" alt="ING Logo" width={60} height={24} className="opacity-80" />
                            </div>
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
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Compte à débiter</Label>
                                    <div className="group relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-gray-50 border-2 border-primary/5 shadow-[0_15px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                                    <Wallet className="h-8 w-8 text-white" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-2xl text-[#333]">ING Compte à vue Private</p>
                                                    <p className="text-sm font-mono font-bold text-muted-foreground tracking-wider">{bankAccount?.iban || 'BE12 3456 7890 1234'}</p>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Disponible</p>
                                                <p className="font-black text-3xl text-primary">€ {balance.toLocaleString('fr-BE', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <FormField
                                    control={form.control}
                                    name="recipientName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">Bénéficiaire</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input placeholder="Nom du destinataire" className="h-16 text-lg font-bold rounded-2xl border-2 pl-12 group-focus-within:border-primary/50 transition-all shadow-sm" {...field} />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="iban"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">IBAN</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input placeholder="BE00 0000 0000 0000" className="h-16 text-lg font-mono font-bold rounded-2xl border-2 pl-12 group-focus-within:border-primary/50 transition-all shadow-sm uppercase" {...field} />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                                        <ShieldCheck className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">Montant</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input type="number" step="0.01" placeholder="0.00" className="h-20 text-4xl font-black rounded-2xl border-2 pl-12 group-focus-within:border-primary/50 transition-all shadow-sm text-[#333]" {...field} />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-2xl">€</div>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                  />
                                  <FormField
                                        control={form.control}
                                        name="executionDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-3">
                                            <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">Date d'exécution</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "h-20 text-left font-black text-xl rounded-2xl border-2 shadow-sm transition-all hover:border-primary/50",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: fr })
                                                    ) : (
                                                        <span>Choisir une date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-7 w-7 text-primary" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl border-2 shadow-2xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                    date < new Date(new Date().setHours(0,0,0,0))
                                                    }
                                                    initialFocus
                                                />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="transferType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-4">
                                        <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">Mode de transmission</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                                            >
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                                                </FormControl>
                                                <Label htmlFor="standard" className="flex flex-col items-center justify-between rounded-3xl border-2 border-muted bg-white p-8 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-md group">
                                                    <div className="p-4 bg-gray-100 rounded-2xl mb-4 group-peer-data-[state=checked]:bg-primary/10 transition-colors">
                                                        <Clock className="h-8 w-8 text-gray-500 group-peer-data-[state=checked]:text-primary" />
                                                    </div>
                                                    <p className="font-black text-2xl mb-1 text-[#333]">SEPA Classique</p>
                                                    <p className="text-sm font-bold text-muted-foreground">Gratuit • 1-2 jours ouvrables</p>
                                                </Label>
                                            </FormItem>
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="instant" id="instant" className="peer sr-only" />
                                                </FormControl>
                                                <Label htmlFor="instant" className="flex flex-col items-center justify-between rounded-3xl border-2 border-muted bg-white p-8 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-md group">
                                                    <div className="p-4 bg-primary/10 rounded-2xl mb-4 group-peer-data-[state=checked]:bg-primary transition-colors">
                                                        <Sparkles className="h-8 w-8 text-primary group-peer-data-[state=checked]:text-white" />
                                                    </div>
                                                    <p className="font-black text-2xl mb-1 text-primary">Virement Instant</p>
                                                    <p className="text-sm font-bold text-muted-foreground">0,60 € • Exécution immédiate</p>
                                                </Label>
                                            </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel className="text-sm font-black uppercase tracking-widest text-muted-foreground">Communication libre</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Indiquez le motif de ce virement (ex: Règlement facture #...)" className="min-h-[140px] text-lg font-bold rounded-2xl border-2 focus:ring-primary/20 resize-none p-6 shadow-sm" {...field} />
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                                />

                                <div className="pt-8">
                                    <Button type="submit" className="w-full h-24 text-3xl font-black rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,98,0,0.3)] hover:shadow-[0_25px_60px_rgba(255,98,0,0.4)] transition-all active:scale-[0.98] group relative overflow-hidden" disabled={isSubmitting}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#ff8c42] to-primary bg-[length:200%_100%] animate-shimmer" />
                                        <span className="relative z-10 flex items-center gap-4">
                                            Signer et Confirmer l'Ordre
                                            <CheckCircle2 className="h-8 w-8" />
                                        </span>
                                    </Button>
                                    <div className="mt-8 flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                            Authentification forte ING Safeguard
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium text-center px-10">
                                            En confirmant cette transaction, vous certifiez l'exactitude des informations saisies. Toute transaction peut faire l'objet d'un délai de contrôle de sécurité.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Form>
    </div>
  );
}
