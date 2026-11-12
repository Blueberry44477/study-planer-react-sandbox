interface HeaderProps {
  onCreateTask: () => void;
}

export default function Header({
  onCreateTask
}: HeaderProps) {
  return(
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Study Planner
          </h1>

          {/*Actions*/}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Створити завдання</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
