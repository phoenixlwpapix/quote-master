import { Check, X, Clock, Package, Truck, CheckCircle } from 'lucide-react';

interface OrderProgressBarProps {
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function OrderProgressBar({ status, createdAt, updatedAt }: OrderProgressBarProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Define the steps dynamically based on the current status
    let steps = [
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'processing', label: 'Processing', icon: Truck },
        { id: 'completed', label: 'Completed', icon: CheckCircle },
    ];

    // If cancelled, replace the final step
    if (status === 'cancelled') {
        steps[2] = { id: 'cancelled', label: 'Cancelled', icon: X };
    }

    const currentIndex = steps.findIndex(s => s.id === status);

    const getStepState = (index: number) => {
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'upcoming';
    };

    const getStepTime = (index: number) => {
        const stepState = getStepState(index);
        if (stepState === 'upcoming') return null;

        // First step always uses created_at
        if (index === 0) return formatDate(createdAt);

        // Current step uses updated_at
        if (index === currentIndex) return formatDate(updatedAt);

        // For completed intermediate steps, we don't have exact timestamps
        return '—';
    };

    const getProgressWidth = () => {
        if (currentIndex <= 0) return '0%';
        if (currentIndex >= steps.length - 1) return '100%';
        return `${(currentIndex / (steps.length - 1)) * 100}%`;
    };

    return (
        <div className="w-full py-2">
            <div className="relative flex items-start justify-between w-full">
                {/* Background Line */}
                <div className="absolute left-[28px] right-[28px] top-7 h-1 bg-slate-700/50 rounded-full" />

                {/* Progress Line */}
                <div
                    className="absolute left-[28px] top-7 h-1 bg-brand-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `calc(${getProgressWidth()} - 28px)` }}
                />

                {steps.map((step, index) => {
                    const stepState = getStepState(index);
                    const StepIcon = step.icon;
                    const stepTime = getStepTime(index);

                    let circleStyles = '';
                    let iconStyles = '';
                    let labelStyles = '';
                    let timeStyles = '';

                    if (stepState === 'completed') {
                        circleStyles = 'bg-brand-500 border-brand-400';
                        iconStyles = 'text-white';
                        labelStyles = 'text-brand-400 font-medium';
                        timeStyles = 'text-brand-400/60';
                    } else if (stepState === 'current') {
                        if (step.id === 'cancelled') {
                            circleStyles = 'bg-red-500/20 border-red-500';
                            iconStyles = 'text-red-400';
                            labelStyles = 'text-red-400 font-semibold';
                            timeStyles = 'text-red-400/60';
                        } else if (step.id === 'completed') {
                            circleStyles = 'bg-brand-500/20 border-brand-500';
                            iconStyles = 'text-brand-400';
                            labelStyles = 'text-brand-400 font-semibold';
                            timeStyles = 'text-brand-400/60';
                        } else if (step.id === 'processing') {
                            circleStyles = 'bg-blue-500/20 border-blue-500';
                            iconStyles = 'text-blue-400';
                            labelStyles = 'text-blue-400 font-semibold';
                            timeStyles = 'text-blue-400/60';
                        } else {
                            circleStyles = 'bg-amber-500/20 border-amber-500';
                            iconStyles = 'text-amber-400';
                            labelStyles = 'text-amber-400 font-semibold';
                            timeStyles = 'text-amber-400/60';
                        }
                    } else {
                        circleStyles = 'bg-slate-800 border-slate-600';
                        iconStyles = 'text-slate-500';
                        labelStyles = 'text-slate-500';
                        timeStyles = 'text-slate-600';
                    }

                    return (
                        <div key={step.id} className="relative flex flex-col items-center flex-1">
                            {/* Circle */}
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${circleStyles}`}
                            >
                                {stepState === 'completed' ? (
                                    <Check size={24} strokeWidth={2.5} className={iconStyles} />
                                ) : (
                                    <StepIcon size={22} strokeWidth={2} className={iconStyles} />
                                )}
                            </div>

                            {/* Label */}
                            <div className={`mt-3 text-sm transition-colors duration-300 ${labelStyles}`}>
                                {step.label}
                            </div>

                            {/* Time */}
                            {stepTime && (
                                <div className={`text-xs transition-colors duration-300 ${timeStyles}`}>
                                    {stepTime}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
