import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { Row } from '../../../../helpers/helpers'

const Caret = styled.span`
    cursor: pointer;
    user-select: none;
    &::before {
        content: '\\2023';
        color: black;
        display: inline-block;
        margin-right: 5px;
    }
    :hover::before {
        color: var(--primary800);
    }
    ${props =>
        props.opened &&
        css`
            &:before {
                transform: rotate(90deg);
            }
        `}
`

const NoCaret = styled.span`
    user-select: none;
    &::before {
        content: '\\2007';
        display: inline-block;
        margin-right: 5px;
    }
`

const OrgUnitText = styled.span`
    cursor: pointer;
    user-select: none;
    &:hover {
        color: var(--primary800);
    }
    ${props =>
        props.isSelected &&
        css`
            color: var(--primary800);
        `}
`

const ChildTree = styled.ul`
    list-style-type: none;
    padding-left: 20px;
    ${props =>
        !props.opened &&
        css`
            display: none;
        `}
`

/**
 * Organisation unit node.
 */
export const OrgUnitNode = props => {
    const { selected, orgUnit, onSelect } = props
    const [opened, setOpened] = useState(false)

    useEffect(() => {
        setOpened(props.selected === props.orgUnit.id)
    }, [props.orgUnit.id])

    const onCarretClick = () => setOpened(!opened)

    return (
        <li key={orgUnit.id}>
            <Row>
                {orgUnit.children.length > 0 ? (
                    <Caret opened={opened} onClick={onCarretClick} />
                ) : (
                    <NoCaret />
                )}
                <OrgUnitText
                    isSelected={selected === orgUnit.id}
                    onClick={() => onSelect(orgUnit.id)}
                >
                    {orgUnit.displayName}
                </OrgUnitText>
            </Row>
            {orgUnit.children.length > 0 && opened ? (
                <ChildTree opened={opened}>
                    {orgUnit.children.map(child => (
                        <OrgUnitNode
                            orgUnit={child}
                            key={child.id}
                            onSelect={onSelect}
                            selected={selected}
                        />
                    ))}
                </ChildTree>
            ) : null}
        </li>
    )
}
