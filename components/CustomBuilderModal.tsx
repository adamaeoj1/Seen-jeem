"use client";

import React from "react";
import { SeenJeemCategory } from "@/data/seedQuestions";
import { QuestionStudioModal } from "@/components/QuestionStudioModal";

interface CustomBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (cat: SeenJeemCategory) => void;
  onBankUpdated?: () => void;
}

export function CustomBuilderModal({
  isOpen,
  onClose,
  onSaveCategory,
  onBankUpdated,
}: CustomBuilderModalProps) {
  return (
    <QuestionStudioModal
      isOpen={isOpen}
      onClose={onClose}
      onSaveCategory={onSaveCategory}
      onBankUpdated={onBankUpdated}
    />
  );
}
