"use client";

import React, { useEffect, useState } from "react";
import { FileText, ExternalLink, Loader2, RefreshCw, FolderOpen } from "lucide-react";

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
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      } else {
        setError(data.error || "取得に失敗しました");
      }
    } catch (e) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-10 bg-white min-h-screen font-sans">
      <header className="flex justify-between items-end mb-12 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-800 uppercase">Documents</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Google Drive Connection Active
          </p>
        </div>
        <button 
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs hover:bg-slate-700 transition-all shadow-lg active:scale-95"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          REFRESH
        </button>
      </header>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-bold text-sm">
          エラー: {error}
          <p className="text-[10px] mt-1 text-red-400 uppercase">Google Driveの共有設定を確認してください</p>
        </div>
      )}

      {loading && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-slate-200">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="font-black tracking-widest text-xs uppercase text-slate-400">Loading Cloud Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {files.map((file) => (
            <div key={file.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[4/3] bg-slate-50 rounded-[1.5rem] mb-6 overflow-hidden flex items-center justify-center border border-slate-50 relative shadow-inner">
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink.replace("s220", "s400")} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                ) : (
                  <FileText size={48} className="text-slate-200" />
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <h3 className="font-black text-slate-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{file.name}</h3>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[#FD9D24] rounded-full"></div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                     Updated: {new Date(file.modifiedTime).toLocaleDateString()}
                   </p>
                </div>
              </div>

              <a 
                href={file.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#FD9D24] text-white rounded-2xl font-black text-xs hover:bg-orange-500 transition-all shadow-md active:scale-95"
              >
                <ExternalLink size={14} />
                VIEW FILE
              </a>
            </div>
          ))}

          {!loading && files.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <FolderOpen size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">No Files Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}