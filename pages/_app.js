import '@/styles/globals.css'
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  return <><Component  {...pageProps} />      <Script lazy src="https://kit.fontawesome.com/ffa807c823.js" crossorigin="anonymous"></Script>
  </>
}
