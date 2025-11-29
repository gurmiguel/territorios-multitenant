import { FAKE_CRAWLER_TOKEN } from './shared-constants'

export function detectCrawler(ua: string) {
  return (/whatsapp/i).test(ua)
}

export function getFakeCrawlerToken() {
  return FAKE_CRAWLER_TOKEN
}
