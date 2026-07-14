/** Возвращает медиану чисел или null, если значений нет. */
export function getMedian(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }

  const sortedValues = [...values].sort((first, second) => first - second)
  const middleIndex = Math.floor(sortedValues.length / 2)

  if (sortedValues.length % 2 !== 0) {
    return sortedValues[middleIndex]
  }

  return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2
}
