import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item, 
  type,
  isDeleting = false 
}) => {
  if (!item) return null;

  const getItemName = () => {
    switch (type) {
      case 'invoice':
        return item.invoiceNumber;
      case 'customer':
        return item.name;
      case 'product':
        return item.name;
      default:
        return 'item';
    }
  };

  const getWarningMessage = () => {
    switch (type) {
      case 'invoice':
        return 'This will permanently delete the invoice and cannot be undone.';
      case 'customer':
        return 'This will permanently delete the customer and all related data. Any pending invoices will be affected.';
      case 'product':
        return 'This will permanently delete the product from inventory. This action cannot be undone.';
      default:
        return 'This action cannot be undone.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{getItemName()}</span>?
          </p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            ⚠️ {getWarningMessage()}
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;