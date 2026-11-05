import Header from "./components/Header.tsx";

export default function App() {
  function handleCreateTask(): void {

  }

  return(
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header onCreateTask={handleCreateTask}/>
    </div>
  )
}
