import Head from 'next/head'

export default function Header() {
  return (
    <>
      <Head>
        <title>Quiz App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <h1 className="title">
          Programming Quiz App
        </h1>
      </header>
    </>
  )
}
