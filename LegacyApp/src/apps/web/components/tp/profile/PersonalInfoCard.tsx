'use client';

import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PersonalInfoCardProps {
  fname: string;
  lname: string;
  isEditing: boolean;
  formFname: string;
  formLname: string;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFnameChange: (value: string) => void;
  onLnameChange: (value: string) => void;
}

export function PersonalInfoCard({
  fname,
  lname,
  isEditing,
  formFname,
  formLname,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onFnameChange,
  onLnameChange,
}: PersonalInfoCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">Personal Information</h3>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <Input
              value={formFname}
              onChange={(e) => onFnameChange(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <Input
              value={formLname}
              onChange={(e) => onLnameChange(e.target.value)}
              placeholder="Last name"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!formFname.trim() || !formLname.trim() || isSaving}
              className="bg-[#356793] hover:bg-[#2a5275]"
            >
              <Check className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">First Name</span>
            <span className="text-sm font-medium text-gray-900">{fname}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Last Name</span>
            <span className="text-sm font-medium text-gray-900">{lname}</span>
          </div>
        </div>
      )}
    </div>
  );
}
