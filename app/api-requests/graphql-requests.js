// Centralized GraphQL API Request Module

// Fetches advanced Pokémon suggestions using the PokeAPI GraphQL Beta endpoint.
export async function fetchAdvancedSuggestionsGraphQL(filters = {}, options = {}) {
    const { types, generationId, includeLegendaries } = filters;
    const whereClause = {};

    whereClause.pokemon_v2_pokemonspecy = {};
    
    if (generationId) {
        whereClause.pokemon_v2_pokemonspecy.generation_id = { _eq: parseInt(generationId, 10) };
    }

    if (!includeLegendaries) {
        // Exclude legendaries and mythicals if includeLegendaries is false
        whereClause.pokemon_v2_pokemonspecy.is_legendary = { _eq: false };
        whereClause.pokemon_v2_pokemonspecy.is_mythical = { _eq: false };
    }

    // Clean up empty object if no specy filters applied
    if (Object.keys(whereClause.pokemon_v2_pokemonspecy).length === 0) {
        delete whereClause.pokemon_v2_pokemonspecy;
    }

    if (types && types.length > 0) {
        whereClause._and = types.map(t => ({
            pokemon_v2_pokemontypes: {
                pokemon_v2_type: { name: { _eq: t } }
            }
        }));
    }

    const query = `
        query getSuggestions($where: pokemon_v2_pokemon_bool_exp) {
            pokemon_v2_pokemon(where: $where) {
                name
                pokemon_v2_pokemonstats {
                    base_stat
                }
                pokemon_v2_pokemontypes {
                    pokemon_v2_type {
                        name
                    }
                }
                pokemon_v2_pokemonspecy {
                    generation_id
                }
            }
        }
    `;

    return fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        body: JSON.stringify({
            query,
            variables: {
                where: whereClause
            }
        })
    });
}
