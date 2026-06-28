import React from 'react';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types/database';
import { formatVND } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const t = useTranslations();
  return (
    <div 
      className="flex overflow-hidden h-[130px] bg-white dark:bg-[var(--color-surface)] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] cursor-pointer group"
      onClick={() => item.is_available && onAdd(item)}
    >
      {/* Image Side */}
      {item.image_url ? (
        <div className="w-[130px] h-full flex-shrink-0 relative overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 130px, 130px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="w-[130px] h-full flex-shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-3xl opacity-50">🍽️</span>
        </div>
      )}

      {/* Content Side */}
      <div className="flex flex-col flex-grow p-3.5 justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-snug">
              {item.name}
            </h3>
            {item.is_featured && <Badge variant="warning" size="sm" className="shadow-sm">Hot</Badge>}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-end mt-2">
          <span className="font-bold text-[var(--color-primary)]">
            {formatVND(item.price)}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item);
            }}
            disabled={!item.is_available}
            variant={item.is_available ? 'primary' : 'secondary'}
            className="rounded-full px-3 h-8 text-xs font-bold shadow-sm"
            style={!item.is_available ? { opacity: 0.5 } : {}}
          >
            {item.is_available ? 'Chọn' : t('customer.menu.out_of_stock')}
          </Button>
        </div>
      </div>
    </div>
  );
}
