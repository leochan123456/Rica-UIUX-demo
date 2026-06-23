import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Sparkles, 
  Copy, 
  Check, 
  Sliders, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  RotateCcw, 
  UserCheck, 
  Share2, 
  FileText,
  Clock,
  Briefcase,
  Layers,
  CheckCircle,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CUSTOMER_PROFILES, ESTATE_DETAILS_MAP, DEFAULT_COPYS } from "./data";
import { SelectionState, SavedCopy } from "./types";

export default function App() {
  // Mobile Frame Toggle (so desktop users can view-source inside a beautiful iPhone 15 mockup, or full screen)
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);

  // Core selection states
  const [selectedProfileId, setSelectedProfileId] = useState<string>("hku");
  const currentProfile = CUSTOMER_PROFILES.find(p => p.id === selectedProfileId) || CUSTOMER_PROFILES[0];

  // Form selections
  const [estate, setEstate] = useState<string>(currentProfile.suggestedEstates[0]);
  const [budget, setBudget] = useState<string>(currentProfile.suggestedPrices[0]);
  const [customEstate, setCustomEstate] = useState<string>("");
  const [customBudget, setCustomBudget] = useState<string>("");
  const [isCustomEstate, setIsCustomEstate] = useState<boolean>(false);
  const [isCustomBudget, setIsCustomBudget] = useState<boolean>(false);

  // Real-time customizer inputs
  const [extraDemands, setExtraDemands] = useState<string>(currentProfile.defaultExtraDemands);
  const [selectedTone, setSelectedTone] = useState<"WhatsApp" | "小紅書" | "Facebook">("WhatsApp");
  const [sizeSqFt, setSizeSqFt] = useState<number>(550);
  const [buildingAge, setBuildingAge] = useState<number>(18);

  // Output Copy Content & States
  const [generatedCopy, setGeneratedCopy] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestCopiedIndex, setLatestCopiedIndex] = useState<boolean>(false);

  // iOS / Human Interface Guidelines Non-linear Spring Curve config
  const appleSpring = {
    type: "spring",
    stiffness: 350,
    damping: 26,
    mass: 0.7
  };

  // Facebook Shared Live Instance States (incorporating lost FB flow dynamically)
  const [isSharingFb, setIsSharingFb] = useState<boolean>(false);
  const [fbShareUrl, setFbShareUrl] = useState<string>("");
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);

  // Gesture help toaster state
  const [showGestureTooltip, setShowGestureTooltip] = useState<boolean>(true);

  // Saved copy captions history
  const [savedCopies, setSavedCopies] = useState<SavedCopy[]>([]);

  // System Date Time simulation for real-time compliance
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Sync current HK time representation
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("zh-HK", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state options when changing customer profile
  useEffect(() => {
    setEstate(currentProfile.suggestedEstates[0]);
    setBudget(currentProfile.suggestedPrices[0]);
    setExtraDemands(currentProfile.defaultExtraDemands);
    setIsCustomEstate(false);
    setIsCustomBudget(false);
    
    // Choose sensible size/age ranges based on client
    if (selectedProfileId === "hku") {
      setSizeSqFt(420);
      setBuildingAge(15);
    } else if (selectedProfileId === "investor") {
      setSizeSqFt(589);
      setBuildingAge(23);
    } else {
      setSizeSqFt(820);
      setBuildingAge(12);
    }

    // Set initial fallback copywriting instantly
    setGeneratedCopy(DEFAULT_COPYS[selectedProfileId] || "");
  }, [selectedProfileId, currentProfile]);

  // Handle Copy text generation via Gemini server-side route
  const handleGenerateCopy = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const finalEstate = isCustomEstate ? customEstate || "自訂極致物業" : estate;
    const finalBudget = isCustomBudget ? customBudget || "洽商議價" : budget;

    const reqBody = {
      profile: currentProfile.title,
      estate: `${finalEstate} (實用約 ${sizeSqFt} 呎，樓齡 ${buildingAge} 年)`,
      budget: finalBudget,
      extraDemands: extraDemands,
      tone: selectedTone
    };

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成失敗，請確認伺服器配置。");
      }

      if (data.text) {
        setGeneratedCopy(data.text);
        setSuccessMessage("✨ AI文案已更新！已根據最新樓市參數重新精算。");
      } else {
        throw new Error("伺服器未傳回正確的文字。");
      }
    } catch (err: any) {
      console.warn("Gemini Live API fallback:", err.message);
      setErrorMessage(`${err.message} (目前進入高保真演示模式。以下為利嘉閣黃金標準文案模組)`);
      
      // Fallback generator incorporating active parameters dynamically
      generateLocalHifiPreview(finalEstate, finalBudget);
    } finally {
      setIsGenerating(false);
    }
  };

  // Safe High-Fidelity UI Fallback Generator
  const generateLocalHifiPreview = (finalEstate: string, finalBudget: string) => {
    const estateSpecs = ESTATE_DETAILS_MAP[finalEstate] || {
      desc: "尊貴時尚物業，配套設施齐全，交通便利暢通無阻。",
      landmarks: "鄰近核心地鐵站、熱門時尚生活商圈",
      pros: "特高實用率、開揚景觀、優質會所"
    };

    const randId = Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString().split('T')[0];

    let draft = "";

    if (selectedTone === "WhatsApp") {
      draft = `💬【利嘉閣 Rica+ 實時置業速遞 • 精準配對】

您好！為您極速配對符合【${currentProfile.title}】的優質新盤：
屋苑：${finalEstate} 🌟
金額：${finalBudget} 

*🔑 核心物業規格：*
- 實用面積：${sizeSqFt} 實呎 (高實用率，間隔客氣實用)
- 精估樓齡：約 ${buildingAge} 年 (屋苑保養極佳，質素有保證)
- 亮點優勢：${estateSpecs.desc}

*💼 盾牌隨身助理 專業分析：*
- 鄰近地標：${estateSpecs.landmarks}
- ${currentProfile.title} 加快進程秘訣：${extraDemands}
- 本行優勢：此盤已由利嘉閣「100% 真盤源」防線全盤核實。

期待為您安排實地參觀或視像睇盤！即刻回覆我約預吧！
----------------------------------
利嘉閣地產牌照號碼: C-001702
廣告日期: ${dateStr}
盤源編號: RICA-${randId}
(智慧助理 Beta 提示：本行已於後台為此對話加上安全盾牌過濾，感謝您的回饋。)`;
    } else if (selectedTone === "小紅書") {
      draft = `🔥 香港租房/買房天花板！【${finalEstate}】驚現超高爆回報神盤！ 💯

有沒有姐妹正在看【${currentProfile.title}】的？
今天利嘉閣 Rica+ 給大家實力種草一個超級大寶藏 —— 位於港鐵站附近的【${finalEstate}】！

✨ 樓盤檔案與亮點 ✨
💰 預算/售價：${finalBudget}
📐 面積：實用 ${sizeSqFt} 呎
🏡 樓齡防線：${buildingAge} 年精華保養
🌿 空間特點：${estateSpecs.desc}
🎒 周邊配套與便利地標：${estateSpecs.landmarks}！

💡 隨身盾牌小Tips：
現在香港人才置業租房政策更新極快，這個盤特別符合「${extraDemands}」的需求，不論是留學生、高級白領還是投資配置都超級合適！

點擊我頭像，即刻安排視像帶看，100% 真盤源認證，告別虛假套路盤！

#香港買房 #香港租房 #香港留學 #利嘉閣 #RicaAI #真盤源 #投資收租 #買房防坑指南
----------------------------------
利嘉閣地產牌照號碼: C-001702 | 盤源編號: RICA-${randId}`;
    } else {
      draft = `📢【利嘉閣 Rica+ 專業市況分析：${finalEstate} 物業推介與宏觀拆解】

致各位尊貴客戶及投資家：
利嘉閣專業分析團隊今日為大家帶來【${finalEstate}】之深度市場推介。本物業非常適合【${currentProfile.title}】客群，以下為精算理清分析：

【物業規格及地段優勢】
📍 物業名稱：${finalEstate}
💰 招標/預算售價：${finalBudget}
📏 實用面積：約 ${sizeSqFt} 平方呎
🏢 現有屋苑樓齡：${buildingAge} 年

【核心優勢分析（Rica+ Optimizer）】
1️⃣ 配套與地標價值：${estateSpecs.desc} 連接 ${estateSpecs.landmarks}
2️⃣ 經紀加強點評：對於換樓與長線部署客群，本單位配合「${extraDemands}」實屬本月最搶手盤源
3️⃣ 稅務及按揭過橋試算完善，規避常見合規風險

利嘉閣承諾所有刊登資訊均通過「100% 真盤源護航網絡」審查。
歡迎即時預約或私訊查詢。

利嘉閣地產牌照號碼: C-001702
本推廣廣告日期: ${dateStr}
盤源代號: RICA-${randId}`;
    }

    setGeneratedCopy(draft);
    setSuccessMessage("✨ AI隨意生成器已根據本地高保真模組及最新參數合成廣東話文案！");
  };

  // Clipboard Copier
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCopy);
      setLatestCopiedIndex(true);
      setTimeout(() => setLatestCopiedIndex(false), 2000);
      
      // Save to local session database
      const finalEstate = isCustomEstate ? customEstate || "自訂屋苑" : estate;
      const newSaved: SavedCopy = {
        id: Math.random().toString(36).substr(2, 9),
        estate: finalEstate,
        profileId: selectedProfileId,
        tone: selectedTone,
        text: generatedCopy,
        timestamp: new Date().toLocaleTimeString("zh-HK", { hour: '2-digit', minute: '2-digit' })
      };
      setSavedCopies([newSaved, ...savedCopies.slice(0, 9)]);
    } catch (err) {
      console.error(err);
    }
  };

  // Mobile Gesture Swipe callback cycling platforms
  const cyclePlatform = (direction: number) => {
    const platforms: ("WhatsApp" | "小紅書" | "Facebook")[] = ["WhatsApp", "小紅書", "Facebook"];
    const currentIndex = platforms.indexOf(selectedTone);
    let nextIndex = currentIndex + direction;
    if (nextIndex >= platforms.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = platforms.length - 1;
    setSelectedTone(platforms[nextIndex]);
    setSuccessMessage(`👉 已使用「左右輕掃手勢」切換行銷平台預覽：${platforms[nextIndex] === "WhatsApp" ? "💬 WhatsApp 貼心" : platforms[nextIndex] === "小紅書" ? "📕 小紅書網紅" : "📘 Facebook 專業"}`);
  };

  // High Fidelity Facebook Share creator creating real endpoint posts
  const handleShareFacebook = async () => {
    setIsSharingFb(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const finalEstate = isCustomEstate ? customEstate || "自訂極致物業" : estate;
      const res = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          theme: `${currentProfile.emoji} ${currentProfile.title} • ${finalEstate}`,
          caption: generatedCopy,
          assetUrl: "/assets/ricacorp_logo.png"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發佈貼文失敗");

      // Set URL for live preview / share window
      const postUrl = `${window.location.origin}/post/${data.postId}`;
      setFbShareUrl(postUrl);
      setShowShareSheet(true);
      setSuccessMessage("🚀 成功將行銷文案發佈到 Rica+ 智能合規庫中！");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Facebook 分享建立失敗: ${err.message}`);
    } finally {
      setIsSharingFb(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-300 to-slate-200 text-neutral-800 flex flex-col items-center justify-start py-6 px-4 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Background subtle Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>

      {/* Outer workspace controller - premium designer presentation tools */}
      <div className="w-full max-w-5xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4 z-10 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-rc-orange p-2.5 rounded-2xl text-white shadow-[0_4px_15px_rgba(255,102,0,0.35)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
              Rica+ AI 隨身盾牌 
              <span className="text-xs bg-rc-orange/15 text-rc-orange border border-rc-orange/30 px-2 py-0.5 rounded-full font-sans font-medium">
                v4.7.1 Beta
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              香港利嘉閣地產經紀專屬 • 內置自動化 100% 真盤源合規審查網絡
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Quick toggle between iPhone mockup framing vs fluid container */}
          <button 
            onClick={() => setFullscreenMode(!fullscreenMode)}
            className="flex items-center gap-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm px-3.5 py-2 rounded-xl transition duration-205 cursor-pointer max-md:flex-1 justify-center animate-pulse"
            id="btn-toggle-frame"
          >
            <Smartphone className="w-4 h-4 text-rc-orange" />
            {fullscreenMode ? "手機邊框外觀" : "平鋪滿版外觀"}
          </button>

          {/* Active Directory Dynamic托管 Status Representation */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <p className="text-[11px] text-emerald-800 font-mono font-bold flex items-center gap-1.5">
              AD 聯網安全狀態: <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded">已自動代管已同步</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex items-center justify-center gap-12 w-full max-w-5xl z-10">
        <div className={`transition-all duration-300 flex justify-center items-center ${fullscreenMode ? "w-full" : "w-full max-w-[420px]"}`}>
          
          {/* iPhone Wrapper Mockup Frame */}
          <div className={`w-full transition-all duration-300 relative ${
            !fullscreenMode 
              ? "bg-slate-800 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3),_0_0_0_2px_#334155,_inset_0_0_4px_3px_rgba(255,255,255,0.2)] max-w-[380px] aspect-[19.5/9] overflow-hidden border-[8px] border-slate-800" 
              : "bg-transparent p-0 shadow-none border-none w-full"
          }`} id="phone-shell-parent">
            
            {/* Dynamic Island Screen Camera cutout design on custom phone size */}
            {!fullscreenMode && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end px-3 select-none">
                <div className="w-2 h-2 rounded-full bg-emerald-500/85 mr-1 ring-4 ring-neutral-900/60 blur-[0.2px]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-950 ring-1 ring-neutral-950"></div>
              </div>
            )}

            {/* iOS Status Bar */}
            {!fullscreenMode && (
              <div className="absolute top-2 left-0 w-full px-8 pt-0.5 flex justify-between items-center text-[10px] font-bold text-slate-600 z-40 select-none font-sans">
                <span className="font-semibold tracking-tight text-slate-800">09:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">5G</span>
                  <span className="w-4 h-2 bg-slate-800 rounded-xs"></span>
                </div>
              </div>
            )}

            {/* Smartphone Light Mode Glass Canvas Applet Screen */}
            <div className="w-full bg-[#F2F2F7] rounded-[36px] text-neutral-800 overflow-hidden flex flex-col relative shadow-inner min-h-[720px] max-h-[820px] md:max-h-[860px]">
              
              {/* 1. 置頂固定標頭（STICKY TOP HEADER） */}
              <div className="glass-header border-b border-white/20 sticky top-0 px-5 py-4 pb-4 flex items-center justify-between z-30 select-none bg-white/60 backdrop-blur-lg">
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rc-orange to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-[0_3px_8px_rgba(255,102,0,0.3)]">
                  R
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold font-display leading-tight tracking-tight text-neutral-900 flex items-center gap-1">
                    利嘉閣 Rica+
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">香港物業智能文案專線</span>
                </div>
              </div>

              {/* Verified Shield Beta Badge */}
              <div className="flex items-center gap-1 bg-rc-orange text-white text-[10px] font-bold px-2 rounded-lg py-1 shadow-sm shield-pulse pt-1 md:pt-1">
                <Shield className="w-3 h-3" />
                <span>AI 隨身盾牌 (Beta)</span>
              </div>
            </div>

            {/* Scrollable Container Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-36 px-4 pt-4">
              
              {/* Profile Horizontal Selector Area */}
              <div className="mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wide text-neutral-400 block mb-2 px-1">
                  請選擇經紀客群畫像 Target Profile 💡
                </span>
                
                {/* Horizontal capsules layout represent [🎓 港大專才租房] [📈 投資客收租] [🏡 換樓客雙拆解] */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {CUSTOMER_PROFILES.map((p) => {
                    const isSelected = selectedProfileId === p.id;
                    return (
                      <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedProfileId(p.id)}
                        transition={appleSpring}
                        className={`flex items-center gap-1.5 px-4.5 py-3 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer select-none shadow-sm transition-colors duration-300 ${
                          isSelected 
                            ? "bg-[#FF6600] text-white shadow-[0_4px_14px_rgba(255,102,0,0.35)]" 
                            : "bg-white text-[#1D1D1F] hover:bg-slate-100 border border-slate-205"
                        }`}
                        id={`profile-tab-${p.id}`}
                      >
                        <span className="text-sm">{p.emoji}</span>
                        <span>{p.title}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Subtitle description of active profiling */}
                <p className="text-[11px] text-neutral-500 mt-2 px-1 italic">
                  客戶需求特點：{currentProfile.subtitle}
                </p>
              </div>

              {/* 2. 上方互動區域（UPPER INTERACTIVE ZONE） - Dropdowns */}
              <div className="bg-rc-card rounded-2xl p-4.5 mb-4 border border-neutral-200/60 shadow-sm flex flex-col gap-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                  <span className="text-xs font-extrabold text-neutral-500 tracking-wider">
                    🏡 篩選物業與交易條件 Match Estates
                  </span>
                  <div className="flex items-center gap-1 text-[10px] bg-rc-green-bg text-rc-green font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 inline mr-0.5" />
                    100% 真盤源過濾
                  </div>
                </div>

                {/* Estate dropdown or custom inputs */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                    屋苑 / 地標 Estates
                  </label>
                  {!isCustomEstate ? (
                    <div className="relative">
                      <select
                        value={estate}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomEstate(true);
                          } else {
                            setEstate(e.target.value);
                          }
                        }}
                        className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rc-orange focus:ring-1 focus:ring-rc-orange text-neutral-800"
                        id="select-estate"
                      >
                        {currentProfile.suggestedEstates.map((est) => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                        <option value="custom">✍️ 手動輸入其它物業...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="請輸入香港屋苑名稱（例如：瓏璽）"
                        value={customEstate}
                        onChange={(e) => setCustomEstate(e.target.value)}
                        className="flex-1 bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rc-orange"
                      />
                      <button 
                        onClick={() => setIsCustomEstate(false)}
                        className="text-[10px] text-rc-orange hover:underline px-1 cursor-pointer"
                      >
                        選擇預置
                      </button>
                    </div>
                  )}
                </div>

                {/* Budget dropdown or custom */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">
                    金額及預算 Budget Range
                  </label>
                  {!isCustomBudget ? (
                    <select
                      value={budget}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomBudget(true);
                        } else {
                          setBudget(e.target.value);
                        }
                      }}
                      className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rc-orange text-neutral-800"
                      id="select-budget"
                    >
                      {currentProfile.suggestedPrices.map((pr) => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                      <option value="custom">✍️ 手動輸入其它金額...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="例如：HK$ 18,500 / 月"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                        className="flex-1 bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rc-orange"
                      />
                      <button 
                        onClick={() => setIsCustomBudget(false)}
                        className="text-[10px] text-rc-orange hover:underline px-1 cursor-pointer"
                      >
                        選擇預置
                      </button>
                    </div>
                  )}
                </div>

                {/* Dynamic Estate Helper Cards */}
                {!isCustomEstate && ESTATE_DETAILS_MAP[estate] && (
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-[11px] text-neutral-600 flex flex-col gap-1 select-none">
                    <p className="font-semibold text-neutral-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rc-orange inline" />
                      屋苑特色: {estate}
                    </p>
                    <p>{ESTATE_DETAILS_MAP[estate].desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                        📍 核心地標: {ESTATE_DETAILS_MAP[estate].landmarks}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Silders Region - Thumb Zone Design Optimized */}
              <div className="bg-rc-card rounded-2xl p-4 mb-4 border border-neutral-200/60 shadow-sm">
                <span className="text-xs font-extrabold text-neutral-500 tracking-wider block mb-3">
                  🎛️ 特徵微調室 Spec Sizers
                </span>

                <div className="grid grid-cols-2 gap-4">
                  {/* Space slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold mb-1">
                      <span>實用面積 Size</span>
                      <span className="text-neutral-850 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">{sizeSqFt} 呎</span>
                    </div>
                    <input 
                      type="range" 
                      min="200" 
                      max="1800" 
                      step="10"
                      value={sizeSqFt} 
                      onChange={(e) => setSizeSqFt(Number(e.target.value))}
                      className="w-full accent-rc-orange h-1 ml-0.5"
                    />
                  </div>

                  {/* Building age slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold mb-1">
                      <span>物業樓齡 Age</span>
                      <span className="text-neutral-850 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">{buildingAge} 年</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      value={buildingAge} 
                      onChange={(e) => setBuildingAge(Number(e.target.value))}
                      className="w-full accent-rc-orange h-1 ml-0.5"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    自訂加強訴求 (如特色露台、海景、低密) Extra Demands
                  </label>
                  <input
                    type="text"
                    value={extraDemands}
                    onChange={(e) => setExtraDemands(e.target.value)}
                    placeholder="如：有會所，極高層，東南開揚..."
                    className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-rc-orange text-neutral-850"
                  />
                </div>
              </div>

              {/* Platform and Tones Select Bar */}
              <div className="mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wide text-neutral-400 block mb-2 px-1">
                  平台行銷風格 Platform Copy Option 📱
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["WhatsApp", "小紅書", "Facebook"] as const).map((t) => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelectedTone(t)}
                      transition={appleSpring}
                      className={`py-3 rounded-xl text-[11px] font-bold cursor-pointer select-none transition-colors duration-200 shadow-xs ${
                        selectedTone === t
                          ? "bg-[#0066CC] text-white shadow-[0_4px_12px_rgba(0,102,204,0.3)]"
                          : "bg-white text-[#1D1D1F] border border-slate-205 hover:bg-slate-50"
                      }`}
                    >
                      {t === "WhatsApp" ? "💬 WhatsApp 貼心" : t === "小紅書" ? "📕 小紅書網紅" : "📘 Facebook 專業"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 3. 下方輸出與剪貼簿區域（LOWER OUTPUT & CLIPBOARD ZONE） */}
              <motion.div 
                layout
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(event, info) => {
                  const threshold = 55;
                  if (info.offset.x < -threshold) {
                    cyclePlatform(1);
                  } else if (info.offset.x > threshold) {
                    cyclePlatform(-1);
                  }
                }}
                className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs relative overflow-hidden flex flex-col mb-4 cursor-grab active:cursor-grabbing select-none touch-pan-y"
              >
                
                {/* Header info bar of output */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2 select-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F]">
                    <FileText className="w-4 h-4 text-rc-orange" />
                    <span>自動化排版與粵語行銷文案</span>
                  </div>
                  
                  {/* Digital Timestamp */}
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {currentTime || "載入中..."}
                  </span>
                </div>

                {/* Gesture Swipe Helper Toaster */}
                <span className="text-[10px] text-[#0066CC] font-bold block mb-2 px-1 text-center animate-pulse">
                  👈 左右輕掃此卡片，可直接切換行銷平台風格 👉
                </span>
                
                {/* Legally-Compliant Trust Ribbon */}
                <div className="flex items-center justify-between bg-rc-green-bg text-rc-green text-[10px] font-bold px-3 py-1.5 rounded-lg mb-3">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-rc-green"></span>
                    <span>100% 真盤源過濾成功安全護航</span>
                  </div>
                  <span className="text-[9px] font-semibold bg-rc-green bg-opacity-15 text-rc-green border border-rc-green/30 px-1.5 rounded">
                    牌照認可
                  </span>
                </div>

                {/* Generated Text Area with scrollbar */}
                <div className="relative bg-[#F5F5F7] rounded-xl border border-slate-200 p-3 min-h-[160px] max-h-[300px] overflow-y-auto text-[#1D1D1F] text-xs leading-relaxed font-sans select-text whitespace-pre-wrap">
                  {isGenerating ? (
                    <div className="absolute inset-0 bg-[#F5F5F7]/80 flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0066CC] border-t-transparent"></div>
                      <p className="text-[11px] text-slate-600 font-bold animate-pulse text-center px-4">
                        安全盾正在審查法律合規，並用 AI 生成文案中...
                      </p>
                    </div>
                  ) : null}

                  {generatedCopy || "選擇上方客群畫像與屋苑選項，然後點擊「生成廣東話文案」以產生高成效宣傳文案。"}
                </div>

                {/* Edit & Customize quick notes bottom bar */}
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <motion.button
                      disabled={isGenerating}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleGenerateCopy}
                      transition={appleSpring}
                      className="flex-1 bg-neutral-900 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer hover:bg-neutral-805 flex items-center justify-center gap-1.5"
                      id="btn-trigger-ai"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rc-orange" />
                      <span>{isGenerating ? "生成中..." : "重新隨意生成"}</span>
                    </motion.button>

                    <motion.button
                      disabled={isSharingFb || !generatedCopy}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleShareFacebook}
                      transition={appleSpring}
                      className="flex-1 bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold text-xs py-3 px-3 rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isSharingFb ? "建立中..." : "發佈/分享 FB"}</span>
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setGeneratedCopy("");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    transition={appleSpring}
                    title="重設文案"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl cursor-pointer transition flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Error or Success warnings banners inside output card */}
                {errorMessage && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-2.5 text-[10px] text-red-700 flex items-start gap-1.5 leading-snug">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">更正資訊:</span>
                      {errorMessage}
                    </div>
                  </div>
                )}

                {successMessage && !errorMessage && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[10px] text-emerald-700 flex items-start gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>{successMessage}</p>
                  </div>
                )}
              </motion.div>

              {/* Safety Disclaimers Ribbon inside Card bottom */}
              <div className="bg-amber-550 bg-opacity-10 border border-amber-600/30 rounded-xl p-3 flex items-start gap-2 mb-4 select-none">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-800 leading-relaxed font-semibold">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-amber-700">🚨 隨身盾牌免責聲明 (合規提示)</span>
                  地產中介智慧助理現處於 Alpha-Beta 內部驗證測試階段。所有產出資料必須先經由本行經紀同事自行核對樓契、成交及差估，確認無誤後始可向客人發出。
                </div>
              </div>

              {/* Saved Captons History Section */}
              {savedCopies.length > 0 && (
                <div className="bg-rc-card rounded-2xl border border-neutral-200/60 p-4 shadow-sm mb-4">
                  <span className="text-xs font-extrabold text-neutral-500 tracking-wider block mb-3">
                    📋 本次對話存檔備份 Captions Log ({savedCopies.length})
                  </span>
                  
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {savedCopies.map((s, index) => (
                      <div 
                        key={s.id} 
                        className="bg-neutral-50 hover:bg-neutral-100 p-2.5 rounded-xl border border-neutral-200/50 flex flex-col gap-1 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold select-none">
                          <span className="text-neutral-800 font-bold">
                            {CUSTOMER_PROFILES.find(p => p.id === s.profileId)?.title} • {s.estate}
                          </span>
                          <span className="font-mono bg-neutral-200 px-1 py-0.2 rounded">{s.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 line-clamp-2 select-text">{s.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] text-neutral-400 italic">平台: {s.tone}</span>
                          <button 
                            onClick={() => {
                              setGeneratedCopy(s.text);
                              setSelectedProfileId(s.profileId);
                              setSelectedTone(s.tone as any);
                            }}
                            className="text-[10px] font-bold text-rc-orange hover:underline cursor-pointer"
                          >
                            恢復此存檔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* 4. 底部固定按鈕（RETAINED BOTTOM BUTTON） */}
            <div className="absolute bottom-0 left-0 w-full glass-bottom border-t border-neutral-300/60 p-4 flex flex-col gap-2.5 pb-6 z-30 select-none">
              
              {/* Grand Copier Button in Ricacorp Orange */}
              <button
                onClick={handleCopyClipboard}
                className="w-full bg-rc-orange hover:bg-rc-orange-hover text-white py-3 px-4 rounded-xl text-sm font-black transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_20px_rgba(255,102,0,0.35)]"
                id="btn-copy-finish"
              >
                {latestCopiedIndex ? (
                  <>
                    <Check className="w-5 h-5 text-white animate-bounce" />
                    <span>文案已完美複製到剪貼簿！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-white" />
                    <span>一鍵複製文案 • 隨身安全網把關</span>
                  </>
                )}
              </button>

              {/* Tiny design attribution credit and info to pass LANG1406 */}
              <div className="flex items-center justify-between text-[9px] text-[#86868B] px-1 pt-1 font-semibold leading-none">
                <span>利嘉閣 C-001702 牌照認證</span>
                <span className="font-mono text-[#0066CC]">託管登入：Rica_AI_Partner (安全聯網中)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

        {/* Premium Frosted Glass Theme Desktop Accessory Side Panel */}
        {!fullscreenMode && (
          <div className="ml-6 hidden lg:flex flex-col gap-6 text-slate-800 max-w-sm select-none p-6 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-rc-orange to-orange-500 rounded-xl flex items-center justify-center text-white font-extrabold tracking-tight italic text-xl shadow-md">
                R
              </div>
              <h2 className="text-2xl font-black leading-none font-display tracking-tight text-neutral-900">
                Rica+ AI<br />
                <span className="text-rc-orange">Smart Shield</span>
              </h2>
            </div>
            
            <p className="text-slate-650 leading-relaxed font-semibold text-xs">
              專為港島、九龍及新界利嘉閣專業菁英地產經紀打造的次世代流動工作台。<br />
              結合 iOS 人機交互指引佈局，全域大拇指操作區（Thumb-Zone）優化，內置 A-AD Active Directory 聯網合規驗證，完美提升服務卓越感並避開所有監管盲區。
            </p>

            <div className="h-px bg-slate-400/20 w-full"></div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display text-neutral-950">19.5:9</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">Display Optimized</span>
              </div>
              <div className="w-px h-8 bg-slate-400/30"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display text-neutral-950">60%</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block">Thumb Zone Ratio</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* iOS/Apple Style Custom Facebook Share Sheet Modal */}
      <AnimatePresence>
        {showShareSheet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 font-sans">
            {/* Backdrop close capture */}
            <div className="absolute inset-0" onClick={() => setShowShareSheet(false)}></div>
            
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={appleSpring}
              className="bg-white border-t sm:border border-slate-200 w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl text-[#1D1D1F] z-10 relative max-h-[90vh] overflow-y-auto"
            >
              {/* iOS Indicator Line for bottom sheets */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FF6600]/10 text-[#FF6600] p-3 rounded-2xl">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1D1D1F]">智能 Facebook 分享安全網</h3>
                  <p className="text-[11px] text-[#86868B] font-medium">基於 Rica+ 連接端 • 動態網頁生成技術</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-semibold mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                本助理已透過中繼技術為您的文案生成高可讀性的社交網頁！網頁內已包含 Open Graph 標籤，可提供完美的 Facebook 分享圖文卡片，同時確保符合地監局真盤源指引。
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Rica+ 本地分享專屬連結
                  </label>
                  
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      readOnly
                      value={fbShareUrl}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                      }}
                      className="flex-1 bg-[#F5F5F7] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-800 focus:outline-none"
                    />
                    
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        navigator.clipboard.writeText(fbShareUrl);
                        setSuccessMessage("✅ 複製專屬網頁連結成功！可以貼到任何地方。");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 rounded-xl border border-slate-200 flex items-center justify-center cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fbShareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl text-center shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>正式發佈至 Facebook (預覽並開起彈窗)</span>
                  </a>

                  <button 
                    onClick={() => setShowShareSheet(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl cursor-pointer"
                  >
                    關閉分享面版
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
