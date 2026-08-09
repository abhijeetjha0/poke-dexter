import { Form, InputGroup, Button } from 'react-bootstrap';
import MaterialIcon from './material-icon';

export default function LocalSearchBar({
    value,
    onChange,
    onKeyDown,
    placeholder = "Search...",
    variant = "dark", // "dark" or "light"
    showClearButton = true,
    children, // Additional addons like match counts or arrows
    className = "",
    id = undefined
}) {
    const isDark = variant === "dark";
    
    const inputClassName = isDark
        ? `bg-dark text-light border-secondary shadow-none ${value ? 'border-end-0' : ''}`
        : `shadow-none ${value ? 'border-end-0' : ''}`;
        
    const iconWrapperClassName = isDark
        ? "bg-dark border-secondary text-light"
        : "";

    const handleClear = () => {
        if (onChange) {
            onChange({ target: { value: '' } });
        }
    };

    const renderIcon = () => (
        <InputGroup.Text className={iconWrapperClassName}>
            <MaterialIcon icon="search" className="fs-5" />
        </InputGroup.Text>
    );

    const renderClearButton = () => {
        if (!showClearButton || !value) {
            return null;
        }
        
        return (
            <Button
                variant={isDark ? "outline-secondary" : "outline-secondary"}
                onClick={handleClear}
                title="Clear search"
                className={`border-start-0 ${isDark ? 'text-light border-secondary' : 'text-secondary bg-transparent'}`}
                style={!isDark ? { borderColor: '#dee2e6' } : {}}
            >
                <MaterialIcon icon="close" className="fs-5 d-flex" />
            </Button>
        );
    };

    return (
        <InputGroup className={className}>
            {renderIcon()}
            
            <Form.Control
                id={id}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className={inputClassName}
            />
            
            {renderClearButton()}
            
            {children}
        </InputGroup>
    );
}
