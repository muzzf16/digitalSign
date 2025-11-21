import React from 'react';
import type { QueueState } from '../../types';

interface AdminQueueProps {
    queue: QueueState;
    updateQueue: (type: 'teller' | 'cs', delta: number) => void;
    resetQueue: (type: 'teller' | 'cs') => void;
    recallQueue: (type: 'teller' | 'cs') => void;
}

const AdminQueue: React.FC<AdminQueueProps> = ({ queue, updateQueue, resetQueue, recallQueue }) => {
    return (
        <section className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><span className="bg-blue-500 w-2 h-6 rounded-full inline-block"></span>Kontrol Antrian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 p-4 rounded-lg text-center border border-slate-600">
                    <div className="text-4xl font-bold mb-3">A-{String(queue.teller).padStart(3, '0')}</div>
                    <div className="flex gap-2 justify-center mb-3">
                        <button onClick={() => updateQueue('teller', -1)} className="bg-slate-600 p-2 rounded">-</button>
                        <button onClick={() => updateQueue('teller', 1)} className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2">Panggil <span className="font-bold">+1</span></button>
                    </div>
                    <div className="flex justify-center gap-4 text-xs underline cursor-pointer"><span onClick={() => resetQueue('teller')} className="text-red-400">Reset</span><span onClick={() => recallQueue('teller')} className="text-amber-400">Panggil Ulang</span></div>
                </div>
                <div className="bg-slate-700/30 p-4 rounded-lg text-center border border-slate-600">
                    <div className="text-4xl font-bold mb-3">B-{String(queue.cs).padStart(3, '0')}</div>
                    <div className="flex gap-2 justify-center mb-3">
                        <button onClick={() => updateQueue('cs', -1)} className="bg-slate-600 p-2 rounded">-</button>
                        <button onClick={() => updateQueue('cs', 1)} className="bg-emerald-600 px-4 py-2 rounded flex items-center gap-2">Panggil <span className="font-bold">+1</span></button>
                    </div>
                    <div className="flex justify-center gap-4 text-xs underline cursor-pointer"><span onClick={() => resetQueue('cs')} className="text-red-400">Reset</span><span onClick={() => recallQueue('cs')} className="text-amber-400">Panggil Ulang</span></div>
                </div>
            </div>
        </section>
    );
};

export default AdminQueue;
