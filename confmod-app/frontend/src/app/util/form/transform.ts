import { keyBy, snakeCase as toSnakeCase } from "lodash";

export interface SnakeCaseArgs {
    /**
     * if true, transform the output to UPPER_SNAKE_CASE, else use lower_snake_case.
     * default: `false`
     */
    uppercase?: boolean
}
/**
 * Factory function for creating different kind of snake_case string transformation functions.
 * @param param0 
 * @returns 
 */
export const snakeCase = ({ uppercase = false }: SnakeCaseArgs) =>
    (value: string): string => {
        const words = value.split(/[\s_]+/)
            .map(word => uppercase ? word.toUpperCase() : word.toLowerCase())
            .filter((word) => !word.match(/^\s*$/));

        const remainder = value.match(/[\s_]*$/);

        return words.join('_') + (remainder !== null ? remainder[0] : '');
    };