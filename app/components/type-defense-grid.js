'use client';

import TypeBadge from './type-badge';
import {
    ALL_TYPES,
    getMultiplierLabel,
    calculateTypeDefenses,
} from '../lib/type-effectiveness-utils';

import { Row, Col, Badge } from 'react-bootstrap';

export default function TypeDefenseGrid(props) {
    const { typeDefensesProp, defenderTypes } = props;
    const defenses = typeDefensesProp ||
        (defenderTypes && defenderTypes.length ? calculateTypeDefenses(defenderTypes) : {});

    return (
        <Row xs={3} sm={4} md={4} lg={3} xl={4} className="g-2" role="region" aria-label="Type Defenses">
            {ALL_TYPES.map((attackType) => {
                const multiplier = defenses[attackType] ?? 1;

                // Map multipliers to Bootstrap badge variants
                let bgVariant = 'secondary';
                let textVariant = 'light';

                if (multiplier > 1) {
                    bgVariant = 'danger';
                } else if (multiplier < 1 && multiplier > 0) {
                    bgVariant = 'success';
                } else if (multiplier === 0) {
                    bgVariant = 'dark';
                    textVariant = 'warning';
                }

                return (
                    <Col key={attackType}>
                        <div className={`p-2 border rounded text-center d-flex flex-column align-items-center justify-content-between h-100 bg-dark border-${bgVariant}`}>
                            <TypeBadge type={attackType} className="mb-1 w-100" />
                            <Badge bg={bgVariant} text={textVariant} className="px-2 py-1">
                                {getMultiplierLabel(multiplier)}
                            </Badge>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );
}
