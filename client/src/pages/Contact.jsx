export default function Contact() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Contact</h1>
      <p className="mb-6">If you'd like to suggest topics or contribute, open an issue on the repository or send an email to the project maintainers using the form below.</p>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Your name" className="w-full p-3 border border-slate-300 rounded-md" />
        <input placeholder="Your email" className="w-full p-3 border border-slate-300 rounded-md" />
        <textarea placeholder="Message" className="w-full p-3 border border-slate-300 rounded-md h-40" />
        <div className="flex items-center gap-3">
          <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-md">Send</button>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-sm underline">Open an issue on GitHub</a>
        </div>
      </form>
    </main>
  )
}
