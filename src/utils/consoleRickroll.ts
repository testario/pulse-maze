import rickrollGifUrl from '../assets/rickroll.gif'

async function getGifDataUrl() {
  const response = await fetch(rickrollGifUrl)

  if (!response.ok) {
    throw new Error(`Не удалось загрузить GIF: ${response.status}`)
  }

  const gifBlob = await response.blob()

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Не удалось преобразовать GIF в data URI'))
        return
      }

      resolve(reader.result)
    })
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(gifBlob)
  })
}

/** Выводит пасхалку в консоль браузера. */
export async function showConsoleRickroll() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const gifDataUrl = await getGifDataUrl()

    console.log(
      '%c ',
      [
        `background-image: url("${gifDataUrl}")`,
        'background-repeat: no-repeat',
        'background-size: 306px 254px',
        'display: block',
        'font-size: 0',
        'line-height: 0',
        'padding: 127px 153px',
      ].join(';'),
    )
  } catch (error) {
    console.error('Не удалось показать рикролл в консоли', error)
  }
}
