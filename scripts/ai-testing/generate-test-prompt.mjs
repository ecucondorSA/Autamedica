import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const filePathArg = args.find(arg => arg.startsWith('--file='));

if (!filePathArg) {
  console.error('Usage: node generate-test-prompt.mjs --file=<path_to_file>');
  process.exit(1);
}

const filePath = filePathArg.split('=')[1];
const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(absolutePath, 'utf-8');
const fileName = path.basename(absolutePath);

const prompt = `
**Actúa como un experto en Quality Assurance y desarrollador de software senior, especializado en TypeScript y en el framework de pruebas Vitest.**

**Tarea:**
Genera una suite de pruebas unitarias completa y robusta para el siguiente archivo de código fuente: 
${fileName}
.

**Archivo de Código Fuente (\`${fileName}\`):**


${fileContent}


**Requisitos de la Suite de Pruebas:**

1.  **Framework**: Utiliza **Vitest** para la estructura de las pruebas (\`describe\`, \`it\`, \`expect\`).
2.  **Mocking**: Utiliza las funciones de mocking de Vitest (\`vi.mock\`, \`vi.fn\`) para aislar el componente o función de sus dependencias externas.
3.  **Cobertura Completa**: Asegúrate de cubrir los siguientes escenarios:
    *   **Casos de Éxito (Happy Paths)**: Prueba la funcionalidad principal con entradas válidas y esperadas.
    *   **Casos Límite (Edge Cases)**: Prueba la funcionalidad con entradas en los límites de lo esperado (ej. valores nulos, undefined, arrays vacíos, strings vacíos, números cero, etc.).
    *   **Casos de Error**: Prueba cómo se comporta el código ante entradas inválidas o condiciones de error esperadas (ej. lanzar excepciones).
4.  **Aserciones Claras**: Utiliza aserciones claras y específicas con \`expect\`. Por ejemplo, en lugar de \`expect(result).toBe(true)\
, prefiere \`expect(result).toBeDefined()\` o \`expect(user.name).toBe('John Doe')\
.
5.  **Estructura Limpia**: Organiza las pruebas de manera lógica dentro de uno o varios bloques \`describe\` para que sean fáciles de leer y mantener.

**Formato de Salida:**
El código de la suite de pruebas debe ser un único bloque de código TypeScript que pueda ser guardado en un archivo \`*.test.ts\`. No incluyas explicaciones adicionales fuera del bloque de código.
`;

console.log(prompt);
