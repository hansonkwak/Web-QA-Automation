import React, { useState, useEffect } from 'react';

export const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'qna'>('faq');
  const [faqs] = useState([
    { id: 1, question: 'What is your return policy?', answer: 'You can return any unused items within 30 days for a full refund.' },
    { id: 2, question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days. Express shipping is 1-2 business days.' },
    { id: 3, question: 'Do you ship internationally?', answer: 'Currently, we only ship within the domestic region for testing purposes.' },
    { id: 4, question: 'How do I cancel my order?', answer: 'You can cancel your order in My Page before it enters the "Shipping" status.' },
  ]);

  const [qnas, setQnas] = useState<any[]>([]);
  const [newQna, setNewQna] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!user.email;

  useEffect(() => {
    const savedQnas = JSON.parse(localStorage.getItem('qnas') || '[]');
    setQnas(savedQnas);
  }, []);

  const handleQnaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQna.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const qna = {
        id: Date.now(),
        author: user.name || 'Anonymous',
        authorEmail: user.email,
        text: newQna,
        isSecret,
        date: new Date().toISOString(),
        replies: []
      };
      const updatedQnas = [qna, ...qnas];
      setQnas(updatedQnas);
      localStorage.setItem('qnas', JSON.stringify(updatedQnas));
      setNewQna('');
      setIsSecret(false);
      setSubmitting(false);
    }, 500);
  };

  return (
    <div data-testid="support-page" className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="material-symbols-outlined text-[48px] text-primary mb-2">support_agent</span>
        <h1 className="font-display-lg text-headline-lg md:text-display-lg text-primary mb-4">Customer Support</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">How can we help you today?</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-surface-variant mb-8">
        <button 
          className={`flex-1 py-4 font-label-md text-label-md text-center transition-colors border-b-2 ${activeTab === 'faq' ? 'border-primary text-primary bg-surface-container-lowest' : 'border-transparent text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'}`}
          onClick={() => setActiveTab('faq')}
          data-testid="tab-faq"
        >
          Frequently Asked Questions
        </button>
        <button 
          className={`flex-1 py-4 font-label-md text-label-md text-center transition-colors border-b-2 ${activeTab === 'qna' ? 'border-primary text-primary bg-surface-container-lowest' : 'border-transparent text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'}`}
          onClick={() => setActiveTab('qna')}
          data-testid="tab-qna"
        >
          Q&A Board
        </button>
      </div>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div data-testid="faq-section" className="flex flex-col gap-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-surface rounded-xl border border-surface-variant p-6 shadow-sm hover:shadow-md transition-shadow" data-testid={`faq-item-${faq.id}`}>
              <h4 className="font-headline-md text-body-lg text-primary mb-3 flex gap-3">
                <span className="text-secondary font-bold">Q.</span> 
                {faq.question}
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant flex gap-3 pl-1">
                <span className="text-primary font-bold">A.</span> 
                <span className="leading-relaxed">{faq.answer}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Q&A Section */}
      {activeTab === 'qna' && (
        <div data-testid="qna-section" className="flex flex-col gap-8">
          <div className="bg-surface rounded-xl border border-surface-variant p-6 shadow-sm">
            <h3 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">edit_square</span>
              Ask a Question
            </h3>
            {!isAuthenticated ? (
              <div className="bg-surface-container-low p-6 rounded-lg text-center border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">lock</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Please log in to ask a question.</p>
              </div>
            ) : (
              <form onSubmit={handleQnaSubmit} data-testid="qna-form" className="flex flex-col gap-4">
                <textarea 
                  value={newQna}
                  onChange={(e) => setNewQna(e.target.value)}
                  placeholder="What would you like to know?"
                  className="w-full p-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary transition-shadow text-body-sm text-on-surface outline-none resize-y min-h-[120px]"
                  data-testid="qna-textarea"
                  required
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isSecret} 
                      onChange={e => setIsSecret(e.target.checked)} 
                      data-testid="qna-secret-checkbox" 
                      className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2"
                    />
                    Make this a secret post (only you can see the answer)
                  </label>
                  <button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-2 px-6 rounded transition-colors flex items-center justify-center gap-2 w-full sm:w-auto" 
                    disabled={submitting} 
                    data-testid="qna-submit-btn"
                  >
                    {submitting ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : 'Submit Question'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-4" data-testid="qna-list">
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Recent Questions</h3>
            {qnas.map(qna => {
              const isOwner = qna.authorEmail === user.email;
              const canView = !qna.isSecret || isOwner;
              
              return (
                <div key={qna.id} className="bg-surface rounded-xl border border-surface-variant p-6 shadow-sm" data-testid={`qna-item-${qna.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {qna.isSecret && <span className="material-symbols-outlined text-[18px] text-error">lock</span>}
                      <span className="font-label-md text-label-md text-primary">{qna.author}</span>
                      {isOwner && <span className="bg-secondary-fixed text-secondary font-code-sm text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide">You</span>}
                    </div>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">{new Date(qna.date).toLocaleDateString()}</span>
                  </div>
                  
                  {canView ? (
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed">{qna.text}</p>
                  ) : (
                    <div className="bg-surface-container-lowest p-4 rounded border border-dashed border-outline-variant text-center">
                      <span className="material-symbols-outlined text-[24px] text-outline mb-2">visibility_off</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant italic">This is a secret post. Only the author can view it.</p>
                    </div>
                  )}
                </div>
              );
            })}
            {qnas.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">forum</span>
                <p className="font-body-md text-body-md">No questions asked yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
