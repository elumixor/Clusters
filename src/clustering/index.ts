export type Cluster = number[]

export function findClusters(colors: number[], columns: number): Cluster[] {
    function isLeftSame(index: number) {
        return index % columns !== 0 && colors[index - 1] === colors[index]
    }
    function isTopSame(index: number) {
        return index >= columns && colors[index - columns] === colors[index]
    }

    const clusters: number[] = Array.from(colors, () => null)

    function setClusters(of: number, to: number) {
        for (let i = 0; i < clusters.length; i++) if (clusters[i] === of) clusters[i] = to
    }

    let id = 0

    for (let i = 0; i < clusters.length; i++) {
        const leftSame = isLeftSame(i)
        const topSame = isTopSame(i)

        if (leftSame) {
            clusters[i] = clusters[i - 1]

            if (topSame) setClusters(clusters[i], clusters[i - columns])
        } else if (topSame) {
            clusters[i] = clusters[i - columns]
        } else {
            clusters[i] = id++
        }
    }

    const clusterDict: { [id: number]: Cluster } = {}

    for (let i = 0; i < clusters.length; i++) {
        let cluster = clusters[i];

        if (cluster === null) continue

        if (clusterDict[cluster]) clusterDict[cluster].push(i)
        else clusterDict[cluster] = [i]
    }

    return Object.values(clusterDict)
}
