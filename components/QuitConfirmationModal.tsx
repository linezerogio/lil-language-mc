'use client'

import React from 'react';

type QuitConfirmationModalProps = {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function QuitConfirmationModal({ isOpen, onConfirm, onCancel }: QuitConfirmationModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1B1C1D] rounded-[25px] p-6 max-w-sm w-full">
                <h3 className="text-xl font-bold text-center mb-4 text-black dark:text-white">
                    Quit Session?
                </h3>
                <p className="text-center text-[#565757] dark:text-[#B2B2B2] mb-6">
                    Are you sure you want to quit? Your progress will be lost.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-[#F5F5F5] dark:bg-[#343737] rounded-[12px] text-black dark:text-white font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 bg-[#FF4444] rounded-[12px] text-white font-semibold"
                    >
                        Quit
                    </button>
                </div>
            </div>
        </div>
    );
}


