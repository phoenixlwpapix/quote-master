import { useState, useCallback, DragEvent } from 'react';

interface UseDragAndDropOptions<T> {
    items: T[];
    onReorder: (items: T[]) => void;
    getItemId: (item: T) => string | number;
}

export function useDragAndDrop<T>({ items, onReorder, getItemId }: UseDragAndDropOptions<T>) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((e: DragEvent<HTMLTableRowElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));

        // Add a slight delay to allow the drag image to be captured
        const target = e.currentTarget;
        setTimeout(() => {
            target.style.opacity = '0.5';
        }, 0);
    }, []);

    const handleDragEnd = useCallback((e: DragEvent<HTMLTableRowElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && index !== draggedIndex) {
            setDragOverIndex(index);
        }
    }, [draggedIndex]);

    const handleDragLeave = useCallback((e: DragEvent<HTMLTableRowElement>) => {
        // Only reset if we're leaving the row entirely, not just moving between children
        const relatedTarget = e.relatedTarget as Node | null;
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverIndex(null);
        }
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLTableRowElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        onReorder(newItems);
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, items, onReorder]);

    const getDragProps = useCallback((index: number) => ({
        draggable: true,
        onDragStart: (e: DragEvent<HTMLTableRowElement>) => handleDragStart(e, index),
        onDragEnd: handleDragEnd,
        onDragOver: (e: DragEvent<HTMLTableRowElement>) => handleDragOver(e, index),
        onDragLeave: handleDragLeave,
        onDrop: (e: DragEvent<HTMLTableRowElement>) => handleDrop(e, index),
    }), [handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop]);

    const getRowClassName = useCallback((index: number, baseClassName: string = '') => {
        const classes = [baseClassName];

        if (draggedIndex === index) {
            classes.push('opacity-50');
        }

        if (dragOverIndex === index && draggedIndex !== null && draggedIndex !== index) {
            if (draggedIndex < index) {
                classes.push('border-b-2 border-b-brand-500');
            } else {
                classes.push('border-t-2 border-t-brand-500');
            }
        }

        return classes.filter(Boolean).join(' ');
    }, [draggedIndex, dragOverIndex]);

    return {
        draggedIndex,
        dragOverIndex,
        getDragProps,
        getRowClassName,
    };
}
