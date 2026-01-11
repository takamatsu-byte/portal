"use client";

import React, { useEffect, useState } from "react";
import { FileText, ExternalLink, Loader2, RefreshCw, FolderOpen, AlertCircle } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  modifiedTime: string;
}

export default function DocumentsPage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/documents"); // 修正後のAPIパス
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      } else {
        setError(data.error || "データの取得に失敗しました。");
      }
    } catch (e) {
      setError("サーバーとの通信に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-10 bg-white min-h-screen">
      <header className="flex justify-between items-end mb-12 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-800 uppercase">Documents</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FD9D24] rounded-full animate-pulse"></span>
            Cloud Storage Service Active
          </p>
        </div>
        <button 
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#FD9D24] text-white rounded-2xl font-black text-xs hover:bg-orange-500 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          更新
        </button>
      </header>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold text-sm flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            {error}
            <p className="text-[10px] mt-1 text-red-400 uppercase">環境変数または共有設定を確認してください</p>
          </div>
        </div>
      )}

      {loading && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-slate-200">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black tracking-widest text-xs uppercase text-slate-400">Connecting to Google Drive...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {files.map((file) => (
            <div key={file.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500">
              <div className="aspect-[4/3] bg-slate-50 rounded-[1.5rem] mb-6 overflow-hidden flex items-center justify-center border border-slate-50 relative">
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink.replace("s220", "s400")} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                ) : (
                  <FileText size={48} className="text-slate-200" />
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="font-black text-slate-700 text-sm line-clamp-2 min-h-[2.5rem] mb-2">{file.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
                  Last Update: {new Date(file.modifiedTime).toLocaleString('ja-JP')}
                </p>
              </div>

              <a 
                href={file.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-xs hover:bg-slate-700 transition-all"
              >
                <ExternalLink size={14} />
                ファイルを開く
              </a>
            </div>
          ))}

          {!loading && files.length === 0 && !error && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <FolderOpen size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">フォルダ内にファイルがありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}