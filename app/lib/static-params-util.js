export async function generateCommonStaticParams(fetchFunction, limit, entityName) {
    try {
        const response = await fetchFunction(limit);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results.map((item) => ({
            name: item.name,
        }));
    } catch (e) {
        console.error(`Failed to generate static params for ${entityName}:`, e);
        return [];
    }
}
