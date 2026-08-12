import React, { useState } from 'react';
import { X, Sparkles, Save, Store } from 'lucide-react';
import { KnowledgeBase } from '../types';

interface KnowledgeBaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  kb: KnowledgeBase;
  onSaveKb: (updated: KnowledgeBase) => void;
}

export const KnowledgeBaseEditorModal: React.FC<KnowledgeBaseEditorModalProps> = ({
  isOpen,
  onClose,
  kb,
  onSaveKb,
}) => {
  const [storeName, setStoreName] = useState(kb.storeName);
  const [contactPhone, setContactPhone] = useState(kb.contactPhone);
  const [aboutStore, setAboutStore] = useState(kb.aboutStore);
  const [deliveryPolicy, setDeliveryPolicy] = useState(kb.deliveryPolicy);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = {
      ...kb,
      storeName,
      contactPhone,
      aboutStore,
      deliveryPolicy,
    };
    onSaveKb(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl lavender-glass border border-[#A584C8]/30 bg-[#160D1F] p-6 sm:p-8 overflow-hidden shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#3A2352] text-[#F2EBF7] hover:bg-[#6B4E8C] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Store className="w-6 h-6 text-[#E24E82]" />
            <h3 className="text-xl font-bold font-serif">Edit Store & AI Knowledge Base</h3>
          </div>

          <p className="text-xs text-[#DBCDEB]">
            Update your store details and policy instructions. NileBot AI Sales Agent reads this data instantly to answer visitor questions.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#DBCDEB] font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
              />
            </div>

            <div>
              <label className="block text-[#DBCDEB] font-semibold mb-1">Contact Phone / WhatsApp</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
              />
            </div>

            <div>
              <label className="block text-[#DBCDEB] font-semibold mb-1">About Store / Bio</label>
              <textarea
                rows={3}
                value={aboutStore}
                onChange={(e) => setAboutStore(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
              />
            </div>

            <div>
              <label className="block text-[#DBCDEB] font-semibold mb-1">Delivery Policy in Juba</label>
              <textarea
                rows={3}
                value={deliveryPolicy}
                onChange={(e) => setDeliveryPolicy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#6B4E8C] to-[#E24E82] text-white text-xs font-bold hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Train AI Assistant</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
