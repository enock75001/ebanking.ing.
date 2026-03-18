"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

export default function RibPage() {
    const { toast } = useToast();
    const accountDetails = {
        holder: "Juliane Laporte",
        iban: "BE12 3456 7890 1234",
        bic: "INGBBEBB",
        bank: "ING Belgium SA/NV"
    };

    const handleCopy = () => {
        const detailsText = `Account Holder: ${accountDetails.holder}\nBank: ${accountDetails.bank}\nIBAN: ${accountDetails.iban}\nBIC: ${accountDetails.bic}`;
        navigator.clipboard.writeText(detailsText);
        toast({
            title: "Copied to clipboard!",
            description: "Your account details have been copied.",
        });
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Bank Account Details (RIB)</h1>
                <p className="text-muted-foreground">
                    Your unique account identifiers for receiving payments.
                </p>
            </header>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Your Details</CardTitle>
                    <CardDescription>Share these details to receive money.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">Account Holder</span>
                        <span className="font-semibold">{accountDetails.holder}</span>
                    </div>
                     <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-semibold">{accountDetails.bank}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">IBAN</span>
                        <span className="font-mono font-semibold">{accountDetails.iban}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                        <span className="text-muted-foreground">BIC/SWIFT</span>
                        <span className="font-mono font-semibold">{accountDetails.bic}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button onClick={handleCopy} className="flex-1">
                            <Copy className="mr-2 h-4 w-4"/> Copy Details
                        </Button>
                        <Button variant="secondary" className="flex-1">
                            <Download className="mr-2 h-4 w-4"/> Download as PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
