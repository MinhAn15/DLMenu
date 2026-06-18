import React from 'react';
import type { MenuItem } from '@/lib/types/database';
import { formatVND } from '@/lib/utils/format';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <Card padding="none" variant="glass" className="flex overflow-hidden h-[120px] hover-lift active-press">
      {/* Image Side */}
      {item.image_url ? (
        <div className="w-[120px] h-full flex-shrink-0 bg-gray-100">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-[120px] h-full flex-shrink-0 bg-[var(--color-primary-light)] opacity-10 flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}

      {/* Content Side */}
      <div className="flex flex-col flex-grow p-3 justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-heading font-semibold text-[var(--color-text)] line-clamp-2 text-sm">
              {item.name}
            </h3>
            {item.is_featured && <Badge variant="warning" size="sm">Hot</Badge>}
          </div>
          {item.description && (
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mt-1">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
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
            style={!item.is_available ? { opacity: 0.5 } : {}}
          >
            {item.is_available ? 'Thêm' : 'Hết'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
