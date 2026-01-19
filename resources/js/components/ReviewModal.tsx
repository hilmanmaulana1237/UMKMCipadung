import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { ReviewSentiment } from '@/types';

declare function route(name: string, params?: any): string;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    storeName: string;
}

export default function ReviewModal({ isOpen, onClose, orderId, storeName }: Props) {
    const [selectedSentiment, setSelectedSentiment] = useState<ReviewSentiment | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        sentiment: '' as ReviewSentiment,
        comment: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSentiment) {
            toast.error('Pilih sentiment terlebih dahulu');
            return;
        }

        post(`/orders/${orderId}/review`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Terima kasih atas review Anda! 🎉');
                onClose();
                setSelectedSentiment(null);
                setData('comment', '');
            },
            onError: () => {
                toast.error('Gagal mengirim review');
            },
        });
    };

    const selectSentiment = (sentiment: ReviewSentiment) => {
        setSelectedSentiment(sentiment);
        setData('sentiment', sentiment);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                {/* Header */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 relative">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 text-white/80 hover:text-white p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-xl font-bold text-white">
                                        Berikan Review
                                    </h3>
                                    <p className="text-white/80 text-sm mt-1">
                                        {storeName}
                                    </p>
                                </div>

                                {/* Content */}
                                <form onSubmit={handleSubmit} className="p-6">
                                    <p className="text-slate-700 font-medium mb-4">
                                        Bagaimana pengalaman belanja Anda?
                                    </p>

                                    {/* Sentiment Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => selectSentiment('positive')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedSentiment === 'positive'
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : 'border-slate-200 hover:border-green-300 hover:bg-green-50/50'
                                                }`}
                                        >
                                            <ThumbsUp
                                                className={`w-8 h-8 ${selectedSentiment === 'positive'
                                                    ? 'text-green-600'
                                                    : 'text-slate-400'
                                                    }`}
                                            />
                                            <span
                                                className={`font-semibold ${selectedSentiment === 'positive'
                                                    ? 'text-green-700'
                                                    : 'text-slate-600'
                                                    }`}
                                            >
                                                Positif 😊
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => selectSentiment('negative')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedSentiment === 'negative'
                                                ? 'border-red-500 bg-red-50 shadow-md'
                                                : 'border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                                                }`}
                                        >
                                            <ThumbsDown
                                                className={`w-8 h-8 ${selectedSentiment === 'negative'
                                                    ? 'text-red-600'
                                                    : 'text-slate-400'
                                                    }`}
                                            />
                                            <span
                                                className={`font-semibold ${selectedSentiment === 'negative'
                                                    ? 'text-red-700'
                                                    : 'text-slate-600'
                                                    }`}
                                            >
                                                Negatif 😞
                                            </span>
                                        </button>
                                    </div>

                                    {errors.sentiment && (
                                        <p className="text-red-500 text-sm mb-3">
                                            {errors.sentiment}
                                        </p>
                                    )}

                                    {/* Comment */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Komentar (opsional)
                                        </label>
                                        <textarea
                                            value={data.comment}
                                            onChange={e => setData('comment', e.target.value)}
                                            placeholder="Ceritakan pengalaman Anda..."
                                            rows={3}
                                            maxLength={500}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            {data.comment.length}/500 karakter
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Send className="w-4 h-4" />
                                        {processing ? 'Mengirim...' : 'Kirim Review'}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
