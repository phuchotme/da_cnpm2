import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Lock } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: number;
    title: string;
    description: string;
  };
}

export default function DonationModal({ isOpen, onClose, campaign }: DonationModalProps) {
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("money");
  const [anonymous, setAnonymous] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const donationMutation = useMutation({
    mutationFn: async (data: { campaignId: number; amount: number; type: string; anonymous: boolean }) => {
      const response = await apiRequest('POST', '/api/donations', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your donation!",
        description: "Your donation has been processed successfully. You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/donations/campaign/${campaign.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/donations/user/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      setAmount("");
      setDonationType("money");
      setAnonymous(false);
    },
    onError: (error) => {
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    donationMutation.mutate({
      campaignId: campaign.id,
      amount: donationAmount,
      type: donationType,
      anonymous,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Make a Donation
          </DialogTitle>
          <DialogDescription>Support this campaign and make a difference</DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 mb-2">{campaign.title}</h4>
          <p className="text-sm text-neutral-600">{campaign.description.substring(0, 100)}...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Donation Amount</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount(25)}
                className="py-2 px-4 text-sm"
              >
                $25
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount(50)}
                className="py-2 px-4 text-sm"
              >
                $50
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount(100)}
                className="py-2 px-4 text-sm"
              >
                $100
              </Button>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Donation Type</Label>
            <RadioGroup value={donationType} onValueChange={setDonationType}>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <RadioGroupItem value="money" className="mr-2" />
                  <div>
                    <div className="font-medium text-sm">Money</div>
                    <div className="text-xs text-neutral-600">Monetary donation</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <RadioGroupItem value="goods" className="mr-2" />
                  <div>
                    <div className="font-medium text-sm">Goods</div>
                    <div className="text-xs text-neutral-600">Physical items</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm text-neutral-600">
              Make this donation anonymous
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={donationMutation.isPending}
          >
            {donationMutation.isPending ? "Processing..." : "Donate Now"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-neutral-500 flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Secure payment processing with 100% transparency guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
