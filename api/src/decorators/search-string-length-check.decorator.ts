import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function SearchStringLengthCheck(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: LengthConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'SearchStringLengthCheck' })
export class LengthConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return value.length >= 3 || value.length === 0;
  }
}
