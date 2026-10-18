import PublicShop from './public-shop'
import { transcript } from '../../../lib/transcript.js'

export default function ShopPage() {
  return <PublicShop bannerText={transcript('banner')} />
}
