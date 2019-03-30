import { get } from './crud'

const _organismsDataElementId = 'SaQe2REkGVw'
const _amrDataElement = 'lIkk661BLpG'
const _l1ApprovalStatus = 'tAyVrNUTVHX'
const _l1RejectionReason = 'NLmLwjdSHMv'
const _l1RevisionReason = 'wCNQtIHJRON'
const _l2ApprovalStatus = 'sXDQT6Yaf77'
const _l2RejectionReason = 'pz8SoHBO6RL'
const _l2RevisionReason = 'fEnFVvEFKVc'

export const getProgramStageApproval = async (pStage, values, completed, newRecord, isL1User, isL2User) => {
    let { programStage, status, eventValues } = await getProgramStage(pStage, values, completed, newRecord, isL1User, isL2User)
    return { programStage, eventValues, status }
}

export const getProgramStageDeo = async (pStage, values, completed, newRecord) => {
    let { programStage, status, eventValues } = await getProgramStage(pStage, values, completed, newRecord)

    if (!eventValues[_l1ApprovalStatus] && !eventValues[_l2ApprovalStatus]) {
        let approvalSection = programStage.programStageSections.find(section => section.name === 'Approval')
        if (approvalSection) approvalSection.hideWithValues = true
    }

    return { programStage, eventValues, status }
}

/**
 * Gets values for a single event.
 * @param {string} eventId - AMR Id.
 * @returns {Object} Event values.
 */
export const getEventValues = async eventId => {
    const event = await get('events/' + eventId)
    let values = {}

    if (event.dataValues)
        event.dataValues.forEach(
            dataValue => (values[dataValue.dataElement] = dataValue.value)
        )

    return {
        programId: event.program,
        programStageId: event.programStage,
        eventValues: values,
        completed: event.status === 'COMPLETED',
        entityId: event.trackedEntityInstance
    }
}

/**
 * Gets all tracked entity program rules.
 * @param {Object} attributeIds - Object with attribute name as key and id as value.
 * @returns {Object} Tracked entity program rules.
 */
export const getEntityRules = async attributeIds => {
    // Replaces 'A{xxx}' with 'this.state.values['id of xxx']'
    const getCondition = condition => {
        const variableDuplicated = condition.match(/A\{.*?\}/g)
        let variables = []
        if (!variableDuplicated) return condition
        variableDuplicated.forEach(duplicated => {
            if (variables.indexOf(duplicated) === -1) variables.push(duplicated)
        })

        variables.forEach(variable => {
            const id = attributeIds[variable.substring(2, variable.length - 1)]
            condition = condition.replace(/A\{.*?\}/g, "values['" + id + "']")
        })

        return condition
    }

    let data = (await get(
        'programRules.json?paging=false&fields=name,programRuleActions[' +
            'programRuleActionType,optionGroup[id,options[code,displayName]],trackedEntityAttribute[name,id]' +
            ',programRule[condition]]&order=priority:asc&filter=programRuleActions.trackedEntityAttribute:!null' +
            '&filter=programRuleActions.programRuleActionType:in:[SHOWOPTIONGROUP,HIDEFIELD]'
    )).programRules

    let rules = []
    data.forEach(d => {
        if (!rules.find(rule => rule.name === d.name)) {
            d.programRuleActions.forEach(programRuleAction => {
                programRuleAction.programRule.condition = getCondition(
                    programRuleAction.programRule.condition
                )
                if (
                    programRuleAction.programRuleActionType ===
                    'SHOWOPTIONGROUP'
                ) {
                    let options = []

                    programRuleAction.optionGroup.options.forEach(option =>
                        options.push({
                            value: option.code,
                            label: option.displayName,
                        })
                    )
                    programRuleAction.optionGroup.options = options
                }
            })
            rules.push(d)
        }
    })

    return rules
}

/**
 * Generates AMR Id consisting of OU code and a random integer.
 * @param {string} orgUnitId - Organisation unit ID.
 * @returns {string} AMR Id.
 */
export const generateAmrId = async orgUnitId => {
    const orgUnitCode = (await get(
        'organisationUnits/' + orgUnitId + '.json?fields=code'
    )).code

    const newCode = () =>
        orgUnitCode + (Math.floor(Math.random() * 90000) + 10000)

    let amrId = newCode()
    while (
        (await get(
            'events.json?paging=false&fields=event&orgUnit=' +
                orgUnitId +
                '&filter=' +
                _amrDataElement +
                ':eq:' +
                amrId
        )).events.length !== 0
    )
        amrId = newCode()

    return amrId
}

/**
 * Gets AMR program rules.
 * @returns {Object} Object with data element and section rules.
 */
const getProgramRules = async (programId, programStageId) => {
    // Replaces '#{xxx}' with 'this.state.values['id of xxx']'
    const getCondition = condition => {
        const original = condition
        try {
            const variableDuplicated = condition.match(/#\{.*?\}/g)
            let variables = []
            if (!variableDuplicated) return condition
            variableDuplicated.forEach(duplicated => {
                if (variables.indexOf(duplicated) === -1)
                    variables.push(duplicated)
            })
            variables.forEach(variable => {
                const name = variable.substring(2, variable.length - 1)
                const id = programRuleVariables.find(
                    ruleVariable => ruleVariable.name === name
                ).dataElement.id
                condition = condition.replace(
                    new RegExp('#{' + name + '}', 'g'),
                    "values['" + id + "']"
                )
            })
        } catch {
            console.warn('Improper condition:', original)
        }
        return condition
    }

    // Program specific dataElement rules.
    let dataElementRules = (await get(
        'programRules.json?paging=false&fields=condition,programRuleActions[dataElement[id,name],data,programRuleActionType,' +
            'optionGroup[id,options[code,displayName]]&filter=programRuleActions.dataElement:!null&filter=programStage:null&' +
            'order=priority:asc&filter=programRuleActions.programRuleActionType:in:[SHOWOPTIONGROUP,HIDEFIELD,ASSIGN]' +
            '&filter=program.id:eq:' +
            programId
    )).programRules

    // ProgramStage specific dataElement rules.
    let dataElementRulesStage = (await get(
        'programRules.json?paging=false&fields=condition,programRuleActions[dataElement[id,name],data,programRuleActionType,' +
            'optionGroup[id,options[code,displayName]]&filter=programRuleActions.dataElement:!null&filter=programRuleActions.' +
            'programRuleActionType:in:[SHOWOPTIONGROUP,HIDEFIELD,ASSIGN]&order=priority:asc&&filter=programStage.id:eq:' +
            programStageId
    )).programRules

    // Program specific section rules.
    let sectionRules = (await get(
        'programRules.json?paging=false&fields=condition,programRuleActions[programStageSection[name,id],programRuleActionType]' +
            '&filter=programRuleActions.programStageSection:!null&filter=programStage:null&filter=' +
            'programRuleActions.programRuleActionType:eq:HIDESECTION&order=priority:asc&&filter=program.id:eq:' +
            programId
    )).programRules

    // ProgramStage specific section rules.
    let sectionRulesStage = (await get(
        'programRules.json?paging=false&fields=condition,programRuleActions[programStageSection[name,id],programRuleActionType]' +
            '&filter=programRuleActions.programStageSection:!null&programRuleActions.programRuleActionType:eq:' +
            'HIDESECTION&order=priority:asc&&filter=programStage.id:eq:' +
            programStageId
    )).programRules

    const programRuleVariables = (await get(
        'programRuleVariables.json?paging=false&fields=name,dataElement&filter=program.id:eq:' +
            programId
    )).programRuleVariables

    let rules = dataElementRules.concat(
        sectionRules,
        dataElementRulesStage,
        sectionRulesStage
    )
    rules.forEach(rule => {
        rule.condition = getCondition(rule.condition)
        rule.programRuleActions.forEach(programRuleAction => {
            if (programRuleAction.programRuleActionType === 'SHOWOPTIONGROUP') {
                let options = []
                // For some reason there are duplicates in the option group. Organisms only?
                programRuleAction.optionGroup.options.forEach(option => {
                    if (!options.find(o => o.value === option.code))
                        options.push({
                            value: option.code,
                            label: option.displayName,
                        })
                })
                programRuleAction.optionGroup.options = options
            }
        })
    })

    return rules
}

const getProgramStage = async (
    programStage,
    values,
    completed,
    newRecord,
    isL1User,
    isL2User
) => {
    const shouldDisable = element => {
        switch (element.id) {
            case _amrDataElement:
                return values[_amrDataElement] && values[_amrDataElement] !== ''
            case _organismsDataElementId:
                return values[_organismsDataElementId] && values[_organismsDataElementId] !== ''
            case _l1ApprovalStatus:
            case _l1RejectionReason:
            case _l1RevisionReason:
                return (
                    !isL1User ||
                    values[_l1ApprovalStatus] === 'Approved' ||
                    values[_l1ApprovalStatus] === 'Rejected' ||
                    values[_l2ApprovalStatus] === 'Rejected'
                )
            case _l2ApprovalStatus:
            case _l2RejectionReason:
            case _l2RevisionReason:
                return (
                    !isL2User ||
                    values[_l2ApprovalStatus] === 'Approved' ||
                    values[_l2ApprovalStatus] === 'Rejected' ||
                    values[_l1ApprovalStatus] === 'Rejected'
                )
            default:
                if (newRecord) return false
                else if (isL1User || isL2User) return true
                else
                    return !(
                        (values[_l2ApprovalStatus] === 'Resend' &&
                            values[_l1ApprovalStatus] !== 'Rejected') ||
                        (values[_l1ApprovalStatus] === 'Resend' ||
                            values[_l1ApprovalStatus] === '' ||
                            !values[_l1ApprovalStatus])
                    )
        }
    }

    const setDataElements = (dataElements, psDataElements) =>
        dataElements.forEach(de => {
            de.hide = false
            // Adding missing values.
            if (!values[de.id]) values[de.id] = ''
            // Adding required property.
            de.required = psDataElements.find(psde =>
                psde.dataElement.id === de.id
            ).compulsory
            de.disabled = shouldDisable(de)

        })

    programStage.programStageSections.forEach(s => {
        s.hide = false
        setDataElements(s.dataElements, programStage.programStageDataElements)
        s.childSections.forEach(cs => {
            cs.hide = false
            setDataElements(cs.dataElements, programStage.programStageDataElements)
        })
    })

    const status = {
        deletable: values === {} || (!values[_l1ApprovalStatus] && !values[_l2ApprovalStatus]),
        editable: values === {} || (!values[_l1ApprovalStatus] && !values[_l2ApprovalStatus]) || [values[_l1ApprovalStatus], values[_l2ApprovalStatus]].includes('Resend'),
        finished: values[_l1ApprovalStatus] === values[_l2ApprovalStatus] === 'Approved',
        completed: completed
    }

    return { programStage, status, eventValues: values }
}
