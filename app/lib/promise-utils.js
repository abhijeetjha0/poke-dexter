/**
 * Processes an array of items with a concurrency limit.
 *
 * @param {Array} items - The array of items to process.
 * @param {number} limit - Maximum number of concurrent tasks.
 * @param {Function} asyncFn - An async function (item, index) => Promise<result>.
 * @returns {Promise<Array>} A promise that resolves to an array of results.
 */
export async function limitConcurrency(items, limit, asyncFn) {
    if (!items || !items.length) {
        return [];
    }

    const results = new Array(items.length);
    let currentIndex = 0;

    // Worker function that continually grabs the next available item
    const worker = async () => {
        while (currentIndex < items.length) {
            const index = currentIndex++;
            results[index] = await asyncFn(items[index], index);
        }
    };

    // Spawn exactly 'limit' workers (or fewer if items.length < limit)
    const workersCount = Math.min(limit, items.length);
    const workers = Array.from({ length: workersCount }, worker);

    // Wait for all workers to finish
    await Promise.all(workers);

    return results;
}
