export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">欢迎来到我的博客</h1>
        <p className="text-muted-foreground mb-8">
          探索、记录、创造，持续把想法变成作品。
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">📝 博客</h3>
            <p className="text-sm text-muted-foreground">记录学习与生活的点滴</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">🤖 AI 助手</h3>
            <p className="text-sm text-muted-foreground">基于 GPT 的智能对话</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">📷 相册</h3>
            <p className="text-sm text-muted-foreground">美好瞬间的定格</p>
          </div>
        </div>

        <div className="mt-12 p-4 border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🚧 正在建设中</h2>
          <p className="text-muted-foreground">
            这是一个全新的全栈博客系统，更多功能即将上线...
          </p>
        </div>
      </div>
    </main>
  )
}
