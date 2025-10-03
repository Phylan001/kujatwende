import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  itemName: string;
  confirmInput: string;
  onConfirmInputChange: (value: string) => void;
  isDeleting: boolean;
}

export default function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  itemName,
  confirmInput,
  onConfirmInputChange,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-400 text-lg sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm sm:text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 font-medium text-sm">Warning</p>
            </div>
            <p className="text-white/80 text-xs">
              This will permanently delete {itemName}. This action cannot be
              undone.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm" className="text-slate-300 text-sm">
              Type <span className="font-medium">{confirmText}</span> to
              confirm:
            </Label>
            <Input
              id="deleteConfirm"
              type="text"
              value={confirmInput}
              onChange={(e) => onConfirmInputChange(e.target.value)}
              placeholder={`Enter ${confirmText}`}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-400"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700/50 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting || confirmInput !== confirmText}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
