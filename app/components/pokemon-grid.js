'use client';

import { Row, Col } from 'react-bootstrap';
import PokemonCard from './pokemon-card';
import { getSpeciesName, isVariety } from '../lib/pokemon-utils';

export default function PokemonGrid({ pokemonList, pokemonDetails = {}, showAbilityType = false }) {
    return (
        <Row xs={1} sm={2} md={3} lg={4} xl={4} className="g-3 mb-4">
            {pokemonList.map((pokemon) => {
                const speciesName = pokemon.speciesName || getSpeciesName(pokemon.name);
                const hasVariety = isVariety(pokemon.id, pokemon.name);
                const linkHref = `/pokemons/${speciesName}${hasVariety ? `?form=${pokemon.name}` : ''}`;
                const details = pokemonDetails[pokemon.id];
                const types = details?.types || pokemon.types || [];

                return (
                    <Col key={pokemon.name}>
                        <PokemonCard
                            pokemon={pokemon}
                            types={types}
                            href={linkHref}
                            showAbilityType={showAbilityType}
                        />
                    </Col>
                );
            })}
        </Row>
    );
}
