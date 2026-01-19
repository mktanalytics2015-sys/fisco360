import { useState } from 'react';
import { MessageSquare, Send, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor, seleccione uma avaliação');
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Obrigado pelo seu feedback!');
    setIsOpen(false);
    setRating(0);
    setFeedback('');
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-medium">Feedback</span>
      </button>

      {/* Modal de Feedback */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start p-4 sm:p-6">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-2xl border border-border animate-fade-in ml-0 sm:ml-2 mb-16 sm:mb-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold text-foreground">
                O seu feedback é importante
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Como avalia este simulador?
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentário */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Comentários ou sugestões (opcional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Partilhe a sua experiência ou sugira melhorias..."
                  className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {feedback.length}/500
                </p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn-gold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    A enviar...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
