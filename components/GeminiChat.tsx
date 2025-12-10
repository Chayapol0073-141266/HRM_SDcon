import React, { useState } from 'react';
import { askHRPolicy } from '../services/geminiService';
import { Send, Bot } from 'lucide-react';

export const GeminiChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    const answer = await askHRPolicy(query);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col h-[500px]">
       <div className="flex items-center mb-4 pb-4 border-b border-orange-100">
         <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-3">
            <Bot size={24} />
         </div>
         <div>
           <h2 className="text-lg font-bold text-gray-800">ผู้ช่วย AI HR</h2>
           <p className="text-xs text-gray-500">สอบถามเกี่ยวกับนโยบายบริษัท กฎระเบียบ หรือกฎหมายแรงงาน</p>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-3 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm text-sm text-gray-700 max-w-[80%]">
               สวัสดีครับ! ผมคือผู้ช่วย HR ของคุณ มีเรื่องสงสัยเกี่ยวกับงานหรือกฎระเบียบบริษัท สอบถามได้เลยครับ
             </div>
          </div>
          
          {query && response && (
            <>
              <div className="flex justify-end">
                <div className="bg-orange-500 text-white p-3 rounded-tl-xl rounded-tr-xl rounded-bl-xl shadow-sm text-sm max-w-[80%]">
                  {query}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm text-sm text-gray-700 max-w-[80%]">
                  {response}
                </div>
              </div>
            </>
          )}

          {loading && (
             <div className="flex justify-start">
                <div className="bg-gray-200 animate-pulse w-12 h-8 rounded-xl"></div>
             </div>
          )}
       </div>

       <div className="flex items-center space-x-2">
         <input 
           type="text" 
           className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
           placeholder="พิมพ์คำถามของคุณที่นี่..."
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
         />
         <button 
           onClick={handleAsk}
           disabled={loading}
           className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
         >
           <Send size={20} />
         </button>
       </div>
    </div>
  );
};