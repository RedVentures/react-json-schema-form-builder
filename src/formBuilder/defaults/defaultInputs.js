// @flow
import * as React from 'react';
import { Input } from 'reactstrap';
import { createUseStyles } from 'react-jss';
import FBCheckbox from '../checkbox/FBCheckbox';
import CardEnumOptions from '../CardEnumOptions';
import { getRandomId } from '../utils';
import type { Node } from 'react';
import type { Parameters, FormInput } from '../types';

const useStyles = createUseStyles({
  hidden: {
    display: 'none',
  },
});

// specify the inputs required for a string type object
export function CardDefaultParameterInputs({
  parameters,
  onChange,
}: {
  parameters: Parameters,
  onChange: (Parameters) => void,
}): Node {
  return <div />;
}

const getInputCardBodyComponent = ({ type }: { type: string }) =>
  function InputCardBodyComponent({
    parameters,
    onChange,
  }: {
    parameters: Parameters,
    onChange: (newParams: Parameters) => void,
  }) {
    return (
      <div/>
    );
  };

function Checkbox({
  parameters,
  onChange,
}: {
  parameters: Parameters,
  onChange: (newParams: Parameters) => void,
}) {
  return (
    <div className='card-boolean'>
      <FBCheckbox
        onChangeValue={() => {
          onChange({
            ...parameters,
            default: parameters.default ? parameters.default !== true : true,
          });
        }}
        isChecked={parameters.default ? parameters.default === true : false}
        label='Default'
      />
    </div>
  );
}

function MultipleChoice({
  parameters,
  onChange,
}: {
  parameters: Parameters,
  onChange: (newParams: Parameters) => void,
}) {
  const classes = useStyles();
  const enumArray = Array.isArray(parameters.enum) ? parameters.enum : [];
  // eslint-disable-next-line no-restricted-globals
  const containsUnparsableString = enumArray.some((val) => isNaN(val));
  const containsString =
    containsUnparsableString ||
    enumArray.some((val) => typeof val === 'string');
  const [isNumber, setIsNumber] = React.useState(
    !!enumArray.length && !containsString,
  );
  const [elementId] = React.useState(getRandomId());
  return (
    <div className='card-enum'>
      <h3>Possible Values</h3>
      <CardEnumOptions
        initialValues={enumArray}
        names={
          Array.isArray(parameters.enumNames)
            ? parameters.enumNames.map((val) => `${val}`)
            : undefined
        }
        showNames={Array.isArray(parameters.enumNames)}
        onChange={(newEnum: Array<string>, newEnumNames?: Array<string>) =>
          onChange({
            ...parameters,
            enum: newEnum,
            enumNames: newEnumNames,
          })
        }
        type={isNumber ? 'number' : 'string'}
      />
    </div>
  );
}

const defaultInputs: { [string]: FormInput } = {
  dateTime: {
    displayName: 'Date-Time',
    matchIf: [
      {
        types: ['string'],
        format: 'date-time',
      },
    ],
    defaultDataSchema: {
      format: 'date-time',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'datetime-local' }),
    modalBody: CardDefaultParameterInputs,
  },
  date: {
    displayName: 'Date',
    matchIf: [
      {
        types: ['string'],
        format: 'date',
      },
    ],
    defaultDataSchema: {
      format: 'date',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'date' }),
    modalBody: CardDefaultParameterInputs,
  },
  time: {
    displayName: 'Time',
    matchIf: [
      {
        types: ['string'],
        format: 'time',
      },
    ],
    defaultDataSchema: {
      format: 'time',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'time' }),
    modalBody: CardDefaultParameterInputs,
  },
  checkbox: {
    displayName: 'Checkbox',
    matchIf: [
      {
        types: ['boolean'],
      },
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: 'boolean',
    cardBody: Checkbox,
    modalBody: CardDefaultParameterInputs,
  },
  radio: {
    displayName: 'Radio',
    matchIf: [
      {
        types: ['string', 'number', 'integer', 'array', 'boolean', 'null'],
        widget: 'radio',
        enum: true,
      },
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {
      'ui:widget': 'radio',
    },
    type: 'string',
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs,
  },
  dropdown: {
    displayName: 'Enum',
    matchIf: [
      {
        types: ['string', 'number', 'integer'],
        enum: true,
      },
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {},
    type: 'string',
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs,
  },
};

export default defaultInputs;
