// @flow

import React from 'react';
import Select from 'react-select';
import { Input, FormGroup, FormFeedback } from 'reactstrap';
import classnames from 'classnames';
import GeneralParameterInputs from './GeneralParameterInputs';
import {
  defaultUiProps,
  defaultDataProps,
  categoryToNameMap,
  categoryType,
  subtractArray,
  getRandomId,
} from './utils';
import type { Node } from 'react';
import type { Parameters, Mods, FormInput } from './types';
import Tooltip from './Tooltip';

// specify the inputs required for any type of object
export default function CardGeneralParameterInputs({
  parameters,
  onChange,
  allFormInputs,
  mods,
  showObjectNameInput = true,
}: {
  parameters: Parameters,
  onChange: (newParams: Parameters) => void,
  mods?: Mods,
  allFormInputs: { [string]: FormInput },
  showObjectNameInput?: boolean,
}): Node {
  const [keyState, setKeyState] = React.useState(parameters.name);
  const [keyError, setKeyError] = React.useState(null);
  const [titleState, setTitleState] = React.useState(parameters.title);
  const [descriptionState, setDescriptionState] = React.useState(
    parameters.description,
  );
  const [elementId] = React.useState(getRandomId());
  const categoryMap = categoryToNameMap(parameters.category, allFormInputs);

  const fetchLabel = (labelName: string, defaultLabel: string): string => {
    return mods && mods.labels && typeof mods.labels[labelName] === 'string'
      ? mods.labels[labelName]
      : defaultLabel;
  };

  const objectNameLabel = fetchLabel('objectNameLabel', 'Object Name');
  const displayNameLabel = fetchLabel('displayNameLabel', 'Display Name');
  const descriptionLabel = fetchLabel('descriptionLabel', 'Description');
  const inputTypeLabel = fetchLabel('inputTypeLabel', 'Input Type');

  const availableInputTypes = () => {
    const definitionsInSchema =
      parameters.definitionData &&
      Object.keys(parameters.definitionData).length !== 0;

    // Hide the "Reference" option if there are no definitions in the schema
    let inputKeys = Object.keys(categoryMap).filter(
      (key) => key !== 'ref' || definitionsInSchema,
    );
    // Exclude hidden inputs based on mods
    if (mods) inputKeys = subtractArray(inputKeys, mods.deactivatedFormInputs);

    return inputKeys
      .map((key) => ({ value: key, label: categoryMap[key] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };
  const sensOpts = [
              { value: 'internal', label: 'Internal' },
              { value: 'sensitive', label: 'Sensitive' },
              { value: 'restricted', label: 'Restricted' },
            ];
  return (
    <React.Fragment>
      <div className='card-entry-row'>
        {showObjectNameInput && (
          <div className='card-entry'>
            <h5>
              {`Name `}
              <Tooltip
                text={
                  mods &&
                  mods.tooltipDescriptions &&
                  typeof mods.tooltipDescriptions.cardObjectName === 'string'
                    ? mods.tooltipDescriptions.cardObjectName
                    : 'The back-end name of the object'
                }
                id={`${elementId}_nameinfo`}
                type='help'
              />
            </h5>

            <FormGroup>
              <Input
                invalid={keyError !== null}
                value={keyState || ''}
                placeholder='Key'
                type='text'
                onChange={(ev: SyntheticInputEvent<HTMLInputElement>) =>
                  setKeyState(ev.target.value)
                }
                onBlur={(ev: SyntheticInputEvent<HTMLInputElement>) => {
                  const { value } = ev.target;
                  if (
                    value === parameters.name ||
                    !(
                      parameters.neighborNames &&
                      parameters.neighborNames.includes(value)
                    )
                  ) {
                    setKeyError(null);
                    onChange({
                      ...parameters,
                      name: value,
                    });
                  } else {
                    setKeyState(parameters.name);
                    setKeyError(`"${value}" is already in use.`);
                    onChange({ ...parameters });
                  }
                }}
                className='card-text'
              />
              <FormFeedback>{keyError}</FormFeedback>
            </FormGroup>
          </div>
        )}
        <div
          className={`card-entry ${
            parameters.$ref === undefined ? '' : 'disabled-input'
          }`}
        >
          <h5>
            {"Sensitivity "}
            <Tooltip
              text={'Select the sensitivity for this column'}
              id={`${elementId}-sensitivity`}
              type='help'
            />
          </h5>
          <Select
            value={sensOpts.find(({value})=>value===parameters?.meta?.sensitivity) || null}
            placeholder={"Sensitivity"}
            options={sensOpts}
            onChange={({value: sensitivity}: any) => {
              onChange({
                ...parameters,
                meta: {sensitivity}
              });
            }}
            className='card-select'
          />
        </div>
      </div>
      <div className='card-entry-row'>
        <div
          className={`card-entry ${parameters.$ref ? 'disabled-input' : ''}`}
        >
          <h5>
            {`${descriptionLabel} `}
            <Tooltip
              text={
                mods &&
                mods.tooltipDescriptions &&
                typeof mods.tooltipDescriptions.cardDescription === 'string'
                  ? mods.tooltipDescriptions.cardDescription
                  : 'This will appear as help text on the form'
              }
              id={`${elementId}-descriptioninfo`}
              type='help'
            />
          </h5>
          <FormGroup>
            <Input
              value={descriptionState || ''}
              placeholder='Description'
              type='text'
              onChange={(ev: SyntheticInputEvent<HTMLInputElement>) =>
                setDescriptionState(ev.target.value)
              }
              onBlur={(ev: SyntheticInputEvent<HTMLInputElement>) => {
                onChange({ ...parameters, description: ev.target.value });
              }}
              className='card-text'
            />
          </FormGroup>
        </div>
        <div
          className={classnames('card-entry', {
            'wide-card-entry': !showObjectNameInput,
          })}
        >
          <h5>
            {`${inputTypeLabel} `}
            <Tooltip
              text={
                mods &&
                mods.tooltipDescriptions &&
                typeof mods.tooltipDescriptions.cardInputType === 'string'
                  ? mods.tooltipDescriptions.cardInputType
                  : 'The type of form input displayed on the form'
              }
              id={`${elementId}-inputinfo`}
              type='help'
            />
          </h5>
          <Select
            value={{
              value: parameters.category,
              label: categoryMap[parameters.category],
            }}
            placeholder={inputTypeLabel}
            options={availableInputTypes()}
            onChange={(val: any) => {
              // figure out the new 'type'
              const newCategory = val.value;

              const newProps = {
                ...defaultUiProps(newCategory, allFormInputs),
                ...defaultDataProps(newCategory, allFormInputs),
                name: parameters.name,
                required: parameters.required,
              };
              if (newProps.$ref !== undefined && !newProps.$ref) {
                // assign an initial reference
                const firstDefinition = Object.keys(
                  parameters.definitionData,
                )[0];
                newProps.$ref = `#/definitions/${firstDefinition || 'empty'}`;
              }
              onChange({
                ...newProps,
                ...(parameters?.meta ? {meta: {sensitivity: parameters?.meta?.sensitivity}} : {}),
                title: parameters.name,
                default: newProps.default || '',
                type: newProps.type || categoryType(newCategory, allFormInputs),
                category: newProps.category || newCategory,
              });
            }}
            className='card-select'
          />
        </div>
      </div>

      <div className='card-category-options'>
        <GeneralParameterInputs
          category={parameters.category}
          parameters={parameters}
          onChange={onChange}
          mods={mods}
          allFormInputs={allFormInputs}
        />
      </div>
    </React.Fragment>
  );
}
