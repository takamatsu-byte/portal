{/* 既存の物件資料の下に追加 */}
<Link href="/documents/test" className={`flex items-center gap-3 px-6 py-4 transition-all ${pathname === '/documents/test' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
  <FolderOpen size={20} />
  <span className="font-bold text-sm">物件資料 (テスト)</span>
</Link>