import React, { useState, useEffect } from 'react';
import { X, Send, Bot, Database, Phone, RefreshCw, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { TelegramConfig, Order } from '../types';

interface TelegramAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onUpdateConfig: (updated: TelegramConfig) => void;
}

export const TelegramAdminModal: React.FC<TelegramAdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'orders' | 'help'>('config');
  const [botToken, setBotToken] = useState(config.botToken);
  const [chatId, setChatId] = useState(config.chatId);
  const [enabled, setEnabled] = useState(config.enabled);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBotToken(config.botToken);
      setChatId(config.chatId);
      setEnabled(config.enabled);
      fetchOrders();
      fetchHelpRequests();
    }
  }, [isOpen, config]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const res = await fetch('/api/help-requests');
      if (res.ok) {
        const data = await res.json();
        setHelpRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch help requests:', err);
    }
  };

  const handleResendTelegram = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-telegram`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ Order resent to Telegram bot successfully!');
        fetchOrders();
      } else {
        alert(`❌ Resend failed: ${data.error || 'Check Bot Token & Chat ID'}`);
      }
    } catch (err: any) {
      alert(`Error resending to Telegram: ${err?.message || String(err)}`);
    } finally {
      setResendingId(null);
    }
  };

  if (!isOpen) return null;

  const handleTestBot = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId }),
      });

      const data = await res.json();

      // Auto-register webhook so bot responds to incoming texts on Telegram
      fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken }),
      }).catch((e) => console.error('Webhook auto setup error:', e));

      if (res.ok && data.success) {
        setTestResult({ success: true, message: '✅ Success! Test message sent & Auto-Reply Webhook registered!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test message to Telegram. Verify Bot Token & Chat ID.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection error testing Telegram bot.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDetectChatId = async () => {
    setIsDetecting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/telegram/detect-chat-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatId(data.chatId);
        setTestResult({ success: true, message: `✅ ${data.message}` });
      } else {
        setTestResult({ success: false, message: `❌ ${data.error || 'Failed to detect Chat ID'}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Error detecting Chat ID: ${err?.message || String(err)}` });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    const updated = {
      botToken,
      chatId,
      enabled,
      autoNotifyOnOrder: true,
    };
    onUpdateConfig(updated);

    // Register Webhook with Telegram
    if (botToken) {
      try {
        await fetch('/api/telegram/setup-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botToken }),
        });
      } catch (err) {
        console.error('Failed to register Telegram webhook on save:', err);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl lavender-glass border border-[#A584C8]/30 bg-[#160D1F] p-5 sm:p-7 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#3A2352] text-[#F2EBF7] hover:bg-[#6B4E8C] cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8 mb-4">
          <div className="flex items-center gap-2 text-white">
            <Bot className="w-6 h-6 text-[#E24E82]" />
            <h3 className="text-xl font-bold font-serif">Telegram & Firebase Manager</h3>
          </div>
          <p className="text-xs text-[#DBCDEB]">
            Configure Telegram Bot (Alex - Admin Backend Assistant) for order alerts & manage real-time Firebase Firestore orders.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#A584C8]/20 pb-3 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-[#E24E82] text-white shadow-md'
                : 'bg-[#2B1A3E] text-[#DBCDEB] hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Bot Config</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#E24E82] text-white shadow-md'
                : 'bg-[#2B1A3E] text-[#DBCDEB] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('help');
              fetchHelpRequests();
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'bg-[#E24E82] text-white shadow-md'
                : 'bg-[#2B1A3E] text-[#DBCDEB] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Queries ({helpRequests.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-4">
          
          {/* BOT CONFIG TAB */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#DBCDEB] font-semibold mb-1">Bot Token</label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="7829102934:AAGx7q_Zk..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Obtained from Telegram @BotFather when creating your bot.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#DBCDEB] font-semibold">Chat ID / Group ID</label>
                    <button
                      type="button"
                      onClick={handleDetectChatId}
                      disabled={isDetecting}
                      className="text-[11px] text-[#E24E82] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
                      <span>{isDetecting ? 'Detecting...' : 'Auto-Detect My Chat ID'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="e.g. 123456789 or -100234918239"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#2B1A3E] border border-[#A584C8]/30 text-white focus:outline-none focus:border-[#E24E82]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Must be your numeric Telegram user ID (e.g. <code className="text-purple-300 font-bold">812394812</code>) or group ID.
                  </p>
                </div>

                {/* Helpful Fix guide for Chat Not Found */}
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    <AlertCircle className="w-4 h-4 text-[#E24E82]" />
                    <span>How to fix "Bad Request: chat not found"?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Open <strong>Telegram app</strong> on your phone or PC.</li>
                    <li>Search for your bot username (from @BotFather).</li>
                    <li>Open the chat with your bot and tap <strong>START</strong> (or type <code>hello</code>).</li>
                    <li>Click <strong className="text-[#E24E82]">Auto-Detect My Chat ID</strong> above, then click <strong>Save Configuration</strong>!</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="tgEnabled"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#E24E82]"
                  />
                  <label htmlFor="tgEnabled" className="text-[#DBCDEB] font-semibold cursor-pointer">
                    Enable Instant Order & Support Notifications
                  </label>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    testResult.success
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/80 border-red-500/50 text-red-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleTestBot}
                  disabled={isTesting}
                  className="w-1/2 py-3 rounded-full bg-[#3A2352] text-[#F2EBF7] text-xs font-bold hover:bg-[#6B4E8C] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#E24E82]" />
                  <span>{isTesting ? 'Testing...' : 'Test Telegram Bot'}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="w-1/2 py-3 rounded-full bg-gradient-to-r from-[#6B4E8C] to-[#E24E82] text-white text-xs font-bold hover:scale-102 cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          )}

          {/* FIREBASE ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Real-time Orders stored in Firebase Firestore</span>
                <button
                  onClick={fetchOrders}
                  className="flex items-center gap-1 text-[#E24E82] hover:underline cursor-pointer font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No orders saved yet. Place an order on the site or chat to test!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-2xl bg-[#2B1A3E]/60 border border-[#A584C8]/20 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="text-[#E24E82] font-mono">#{order.id}</span>
                        <div className="flex items-center gap-1.5">
                          {order.telegramNotified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Telegram Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[10px]">
                              <AlertCircle className="w-3 h-3" /> Not Sent
                            </span>
                          )}

                          <button
                            onClick={() => handleResendTelegram(order.id)}
                            disabled={resendingId === order.id}
                            className="px-2.5 py-1 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-2.5 h-2.5" />
                            {resendingId === order.id ? 'Sending...' : 'Resend to Telegram'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[#DBCDEB]">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Customer:</span>
                          <strong className="text-white">{order.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Phone Number:</span>
                          <a href={`tel:${order.customerPhone}`} className="text-purple-300 font-semibold hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {order.customerPhone}
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px]">Delivery Address:</span>
                        <span className="text-white">{order.deliveryAddress}, Juba</span>
                      </div>

                      <div className="pt-1 border-t border-[#A584C8]/20 flex items-center justify-between text-[11px]">
                        <span className="text-gray-300">
                          {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                        <strong className="text-emerald-400 font-bold">
                          {order.currency === 'SSP' ? `SSP ${order.totalSSP.toLocaleString()}` : `$${order.totalUSD}`}
                        </strong>
                      </div>

                      {order.telegramError && (
                        <div className="text-[10px] text-red-300 bg-red-950/50 p-1.5 rounded-lg border border-red-500/30 font-mono">
                          Telegram Error: {order.telegramError}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER QUERIES / HELP REQUESTS TAB */}
          {activeTab === 'help' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Customer Help Queries collected by Amina AI</span>
                <button
                  onClick={fetchHelpRequests}
                  className="flex items-center gap-1 text-[#E24E82] hover:underline cursor-pointer font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {helpRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No customer help requests logged yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {helpRequests.map((req, idx) => (
                    <div
                      key={req.id || idx}
                      className="p-3.5 rounded-2xl bg-[#2B1A3E]/60 border border-[#A584C8]/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={`tel:${req.customerPhone}`}
                          className="text-purple-300 font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#E24E82]" />
                          {req.customerPhone}
                        </a>
                        <span className="text-[10px] text-gray-400">
                          {new Date(req.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white bg-[#1A1026] p-2.5 rounded-xl border border-purple-900/40">
                        "{req.customerQuery}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

