import Link from 'next/link';

export default async function Page({ params }) {
    const { name } = params;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
    const responseJSON = await response.json();

    const {
        capture_rate,
        color,
        flavor_text_entries,
        evolves_from_species,
        generation,
        growth_rate,
        id,
        varieties,
    } = responseJSON

    const description = flavor_text_entries.find(({language}) => language.name === 'en');
    const varietyPromises = varieties.map(({ pokemon }) => fetch(pokemon.url));
    const pokeInfoListResponse = await Promise.all(varietyPromises);
    const pokeInfoListJSON = await Promise.all(pokeInfoListResponse.map((response) => response.json()));

    return (
        <>
            <hr></hr>
            <h2 style={{color: color.name}}>#{id} {name.toUpperCase()}</h2>
            <div>{generation.name.toUpperCase()} Pokemon</div>
            <div>
                <h3>{description.flavor_text}</h3>
                <div><strong>Capture Rate:</strong> {capture_rate}</div>
                <div>
                    <strong>Evolves From: </strong>
                    <Link href={`/pokemons/${evolves_from_species?.name}`}>
                        {evolves_from_species?.name.toUpperCase()}
                    </Link>
                </div>
                <div><strong>Growth Rate:</strong> {growth_rate.name}</div>
                <section>
                    <hr></hr>
                    <h3>Varieties:</h3>
                    <div>
                        {pokeInfoListJSON.map(({abilities, moves, name, height, weight, cries, sprites, types}, index) => (
                            <div key={name}>
                                <h4>Form {index + 1}: {name.toUpperCase()}</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Type:</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><i>{types[0].type.name.toUpperCase()}</i></td>
                                            {types[1] ? <td><i>{types[1].type.name.toUpperCase()}</i></td> : ''}
                                        </tr>
                                    </tbody>
                                </table>
                                <img src={sprites.front_default}></img>
                                <img src={sprites.back_default}></img>
                                <div><strong>Height: </strong><i>{height}</i></div>
                                <div><strong>Weight: </strong><i>{weight}</i></div>
                                <div>
                                    <strong>Abilities:</strong>
                                    <i>{abilities.map(({ability}) => ` ${ability.name.toUpperCase()}`)}</i>
                                </div>
                                <div>
                                    <strong>Moves:</strong>
                                    <i>{moves.map(({move}) => ` ${move.name.toUpperCase()}`)}</i>
                                </div>
                                <br></br>
                                <audio controls><source src={cries.latest} type="audio/ogg"></source></audio>
                                <hr></hr>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    )
}