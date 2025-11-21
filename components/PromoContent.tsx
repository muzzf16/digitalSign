import React from 'react';
import type { KreditPromo } from '../types';

interface PromoContentProps {
    promo: KreditPromo | null;
}

const PromoContent: React.FC<PromoContentProps> = ({ promo }) => {
    if (!promo) return null;
    const animationKey = `${promo.title}-${promo.rate}`;
    if (promo.backgroundImage) {
        return (
            <div key={animationKey} className="relative w-full h-full overflow-hidden rounded-lg animate-content-enter flex items-center justify-center">
                <img src={promo.backgroundImage} alt={promo.title} className="object-contain max-w-full max-h-full shadow-2xl rounded-lg" />
            </div>
        );
    }
    return (
        <div key={animationKey} className="relative w-full h-full flex flex-col justify-center p-12 text-white overflow-hidden animate-content-enter">
            <h2 className="text-6xl font-bold leading-tight drop-shadow-lg">{promo.title}</h2>
            <p className="text-3xl font-light drop-shadow-md mt-4">{promo.description}</p>
            <p className="text-8xl font-bold text-amber-400 mt-8 drop-shadow-xl">{promo.rate}</p>
        </div>
    );
};

export default PromoContent;
