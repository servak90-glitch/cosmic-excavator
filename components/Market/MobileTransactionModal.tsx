import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { TL, t } from '../../services/localization';
import type { ResourceType } from '../../types';

interface MobileTransactionModalProps {
    resource: ResourceType;
    buyPrice: number;
    sellPrice: number;
    availableAmount: number;
    credits: number;
    amount: number;
    onAmountChange: (amount: number) => void;
    onBuy: () => void;
    onSell: () => void;
    onClose: () => void;
    lang: 'RU' | 'EN';
}

export const MobileTransactionModal: React.FC<MobileTransactionModalProps> = ({
    resource,
    buyPrice,
    sellPrice,
    availableAmount,
    credits,
    amount,
    onAmountChange,
    onBuy,
    onSell,
    onClose,
    lang
}) => {
    const totalBuyCost = buyPrice * amount;
    const totalSellRevenue = sellPrice * amount;
    const canAfford = credits >= totalBuyCost;
    const canSell = availableAmount >= amount;

    const quickAmounts = [1, 10, 50, 100];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="flex-1 flex flex-col bg-gradient-to-b from-black/90 to-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Заголовок */}
                    <div className="glass-panel border-x-0 border-t-0 rounded-none p-6 flex items-center justify-between border-b border-cyan-500/20 bg-cyan-500/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 glass-panel border-cyan-500/20 bg-cyan-500/10">
                                <Package className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                                    {t(TL.resources[resource], lang)}
                                </h2>
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                                    {t(TL.ui.transaction, lang)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 glass-panel border-white/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                        >
                            <X className="w-6 h-6 text-white/60 hover:text-red-400" />
                        </button>
                    </div>

                    {/* Информация о ценах */}
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div className="glass-panel p-5 border-emerald-500/20 bg-emerald-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                                    {t(TL.ui.buy, lang)}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tracking-tighter italic">
                                    {Math.floor(buyPrice)}
                                </span>
                                <span className="text-sm font-bold text-cyan-400">CR</span>
                            </div>
                        </div>

                        <div className="glass-panel p-5 border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                                    {t(TL.ui.sell, lang)}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tracking-tighter italic">
                                    {Math.floor(sellPrice)}
                                </span>
                                <span className="text-sm font-bold text-cyan-400">CR</span>
                            </div>
                        </div>
                    </div>

                    {/* Статус */}
                    <div className="px-6 pb-6">
                        <div className="glass-panel p-4 border-white/5 bg-black/40 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">
                                    {t(TL.ui.inCargo, lang)}
                                </span>
                                <span className="text-xl font-black text-white">
                                    {availableAmount}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">
                                    {t(TL.ui.creditReserve, lang)}
                                </span>
                                <span className="text-xl font-black text-cyan-400">
                                    {Math.floor(credits).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Выбор количества */}
                    <div className="flex-1 px-6 pb-6 flex flex-col">
                        <span className="text-sm font-black text-white/60 uppercase tracking-widest mb-4">
                            {t(TL.ui.quantity, lang)}
                        </span>

                        {/* Кнопки +/- и ввод */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => onAmountChange(Math.max(1, amount - 10))}
                                className="glass-panel min-h-[56px] min-w-[56px] flex items-center justify-center bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-500/30 transition-all active:scale-95"
                            >
                                <Minus className="w-6 h-6 text-white" />
                            </button>

                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => onAmountChange(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 glass-panel bg-black/60 border-cyan-500/20 text-center text-4xl font-black text-white tracking-tighter italic focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all outline-none"
                            />

                            <button
                                onClick={() => onAmountChange(amount + 10)}
                                className="glass-panel min-h-[56px] min-w-[56px] flex items-center justify-center bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-500/30 transition-all active:scale-95"
                            >
                                <Plus className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Быстрый выбор */}
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {quickAmounts.map(val => (
                                <button
                                    key={val}
                                    onClick={() => onAmountChange(val)}
                                    className={`glass-panel min-h-[48px] font-black text-sm uppercase tracking-widest transition-all ${amount === val
                                        ? 'bg-cyan-500 text-black border-cyan-400'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>

                        {/* Итоговая стоимость */}
                        <div className="glass-panel p-5 border-cyan-500/20 bg-cyan-500/5 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white/60 uppercase tracking-widest">
                                    {lang === 'RU' ? 'Итого' : 'Total'}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white tracking-tighter italic">
                                        {Math.floor(totalBuyCost).toLocaleString()}
                                    </span>
                                    <span className="text-sm font-bold text-cyan-400">CR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки Buy/Sell */}
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <button
                            onClick={onBuy}
                            disabled={!canAfford}
                            className={`min-h-[64px] font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all rounded-xl ${canAfford
                                ? 'bg-white text-black hover:bg-cyan-400 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                            {t(TL.ui.buy, lang)}
                        </button>

                        <button
                            onClick={onSell}
                            disabled={!canSell}
                            className={`min-h-[64px] font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all rounded-xl ${canSell
                                ? 'bg-cyan-500 text-black hover:bg-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.2)] active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            <TrendingDown className="w-5 h-5" />
                            {t(TL.ui.sell, lang)}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
