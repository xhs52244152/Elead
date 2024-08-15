/**
 * Class to generate an image based the diagram interchange information in a
 * BPMN 2.0 process.
 *
 * @author (Javascript) Dmitry Farafonov
 */
var found = false;
var ProcessDiagramGenerator = {
    options: {},

    processDiagramCanvas: [],

    activityDrawInstructions: {},

    processDiagrams: {},

    diagramBreadCrumbs: null,

    init: function () {
        // start event
        this.activityDrawInstructions['startEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawNoneStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // start timer event
        this.activityDrawInstructions['startTimerEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawTimerStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                activityImpl.getProperty('name')
            );
        };

        // start event
        this.activityDrawInstructions['messageStartEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawMessageStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                activityImpl.getProperty('name')
            );
        };

        // start signal event
        this.activityDrawInstructions['startSignalEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawSignalStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                activityImpl.getProperty('name')
            );
        };

        // start multiple event
        this.activityDrawInstructions['startMultipleEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawMultipleStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                activityImpl.getProperty('name')
            );
        };

        // signal catch
        this.activityDrawInstructions['intermediateSignalCatch'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingSignalEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // message catch
        this.activityDrawInstructions['intermediateMessageCatch'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingMessageEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // multiple catch
        this.activityDrawInstructions['intermediateMultipleCatch'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingMultipleEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // signal throw
        this.activityDrawInstructions['intermediateSignalThrow'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawThrowingSignalEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                activityImpl.getProperty('name')
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // message throw
        this.activityDrawInstructions['intermediateMessageThrow'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawThrowingMessageEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                activityImpl.getProperty('name')
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // multiple throw
        this.activityDrawInstructions['intermediateMultipleThrow'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawThrowingMultipleEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                activityImpl.getProperty('name')
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // none throw
        this.activityDrawInstructions['intermediateThrowEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawThrowingNoneEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                activityImpl.getProperty('name')
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // end event
        this.activityDrawInstructions['endEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawNoneEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // error end event
        this.activityDrawInstructions['errorEndEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawErrorEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // message end event
        this.activityDrawInstructions['messageEndEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawMessageEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // signal end event
        this.activityDrawInstructions['signalEndEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawSignalEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // multiple end event
        this.activityDrawInstructions['multipleEndEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawMultipleEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // terminate end event
        this.activityDrawInstructions['terminateEndEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawTerminateEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // error start event
        this.activityDrawInstructions['errorStartEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawErrorStartEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                activityImpl.getProperty('name')
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // task
        this.activityDrawInstructions['task'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            // TODO:
            //
            /*
            var activityImpl = this;
            processDiagramCanvas.drawTask(activityImpl.getProperty("name"), activityImpl.getX(), activityImpl.getY(), activityImpl.getWidth(), activityImpl.getHeight(), thickBorder);
            */
        };

        // user task
        this.activityDrawInstructions['userTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);
            processDiagramCanvas.drawUserTask(activityImpl);
        };
        this.activityDrawInstructions['mailTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawMailTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // script task
        this.activityDrawInstructions['scriptTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawScriptTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // service task
        this.activityDrawInstructions['serviceTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawServiceTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // receive task
        this.activityDrawInstructions['receiveTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawReceiveTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // send task
        this.activityDrawInstructions['sendTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawSendTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // manual task
        this.activityDrawInstructions['manualTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawManualTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // businessRuleTask task
        this.activityDrawInstructions['businessRuleTask'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawBusinessRuleTask(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // exclusive gateway
        this.activityDrawInstructions['exclusiveGateway'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawExclusiveGateway(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // inclusive gateway
        this.activityDrawInstructions['inclusiveGateway'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawInclusiveGateway(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // parallel gateway
        this.activityDrawInstructions['parallelGateway'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawParallelGateway(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // eventBasedGateway
        this.activityDrawInstructions['eventGateway'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawEventBasedGateway(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        // Boundary timer
        this.activityDrawInstructions['boundaryTimerEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingTimerEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // Boundary catch error
        this.activityDrawInstructions['boundaryErrorEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingErrorEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // Boundary signal event
        this.activityDrawInstructions['boundarySignalEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingSignalEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['catchTimerEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingTimerEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['catchSignalEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingSignalEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['throwNoneEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawThrowingNoneEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['throwNoneEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawThrowingSignalEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['endNoneEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawNoneEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['endErrorEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawErrorEndEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['throwEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawThrowingNoneEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        this.activityDrawInstructions['intermediateCatchEvent'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            processDiagramCanvas.drawCatchingTimerEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // Boundary message event
        this.activityDrawInstructions['boundaryMessage'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = activityImpl.getProperty('isInterrupting');
            processDiagramCanvas.drawCatchingMessageEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                null
            );

            var label = ProcessDiagramGenerator.getActivitiLabel(activityImpl);
            if (label) processDiagramCanvas.drawLabel(label.text, label.x, label.y, label.width, label.height);
        };

        // timer catch event
        this.activityDrawInstructions['intermediateTimer'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);

            var isInterrupting = null;
            processDiagramCanvas.drawCatchingTimerEvent(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight(),
                isInterrupting,
                activityImpl.getProperty('name')
            );
        };

        // subprocess
        this.activityDrawInstructions['subProcess'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            // TODO:

            processDiagramCanvas.setConextObject(activityImpl);

            var isExpanded = activityImpl.getProperty('isExpanded');
            var isTriggeredByEvent = activityImpl.getProperty('triggeredByEvent');
            if (isTriggeredByEvent == undefined) {
                isTriggeredByEvent = true;
            }
            // TODO: check why isTriggeredByEvent = true when undefined
            isTriggeredByEvent = false;

            if (isExpanded != undefined && isExpanded == false) {
                processDiagramCanvas.drawCollapsedSubProcess(
                    activityImpl.getProperty('name'),
                    activityImpl.getX(),
                    activityImpl.getY(),
                    activityImpl.getWidth(),
                    activityImpl.getHeight(),
                    isTriggeredByEvent
                );
            } else {
                processDiagramCanvas.drawExpandedSubProcess(
                    activityImpl.getProperty('name'),
                    activityImpl.getX(),
                    activityImpl.getY(),
                    activityImpl.getWidth(),
                    activityImpl.getHeight(),
                    isTriggeredByEvent
                );
            }

            //
        };

        // call activity
        this.activityDrawInstructions['callActivity'] = function () {
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);
            processDiagramCanvas.drawCollapsedCallActivity(
                activityImpl.getProperty('name'),
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        this.activityDrawInstructions['eventBasedGateway'] = function () {
            var activityImpl = this.activity;
            var activityImpl = this.activity;
            var processDiagramCanvas = this.processDiagramCanvas;
            processDiagramCanvas.setConextObject(activityImpl);
            processDiagramCanvas.drawEventBasedGateway(
                activityImpl.getX(),
                activityImpl.getY(),
                activityImpl.getWidth(),
                activityImpl.getHeight()
            );
        };

        $(document).ready(function () {
            // Protect right click on SVG elements (and on canvas too)
            document.body.oncontextmenu = function (event) {
                if (
                    window.event.srcElement.tagName == 'shape' ||
                    (window.event.srcElement.tagName == 'DIV' &&
                        window.event.srcElement.parentElement.className == 'diagram')
                ) {
                    // IE DIAGRAM CANVAS OR SHAPE DETECTED!
                    return false;
                }
                return !Object.isSVGElement(window.event.srcElement);
            };
        });
    },

    getActivitiLabel: function (activityImpl) {
        /*
          TODO: Label object should be in activityImpl and looks like:
          {
            x: 250,
            y: 250,
            width: 80,
            height: 30
          }
          And then:
          if (!activityImpl.label)
            return null;
          var label = activityImpl.label;
          label.text = activityImpl.name;
          return label;
        */

        // But now default label for all events is:
        return {
            text: activityImpl.getProperty('name'),
            x: activityImpl.getX() + 0.5 + activityImpl.getWidth() / 2,
            y: activityImpl.getY() + 0.5 + activityImpl.getHeight() + ICON_PADDING,
            width: 100,
            height: 0
        };
    },

    generateDiagram: function (processDefinitionDiagramLayout) {
        // Init canvas
        var processDefinitionId = processDefinitionDiagramLayout.processDefinition.id;

        if (this.getProcessDiagram(processDefinitionId) != undefined) {
            // TODO: may be reset canvas if exists.. Or just show
            return;
        }
        var processDiagram = this.initProcessDiagramCanvas(processDefinitionDiagramLayout);
        var processDiagramCanvas = processDiagram.diagramCanvas;

        // Draw pool shape, if process is participant in collaboration

        if (processDefinitionDiagramLayout.participantProcess != undefined) {
            var pProc = processDefinitionDiagramLayout.participantProcess;
            processDiagramCanvas.drawPoolOrLane(pProc.x, pProc.y, pProc.width, pProc.height, pProc.name);
        }

        var laneSets = processDefinitionDiagramLayout.laneSets;
        var activities = processDefinitionDiagramLayout.activities;
        var sequenceFlows = processDefinitionDiagramLayout.sequenceFlows;

        pb1.set('value', 0);
        var cnt = 0;
        if (laneSets)
            for (var i in laneSets) {
                cnt += laneSets[i].lanes.length;
            }
        if (activities) cnt += activities.length;
        if (sequenceFlows) cnt += sequenceFlows.length;
        var step = cnt > 0 ? 100 / cnt : 0;
        var progress = 0;

        var task1 = new $.AsyncQueue();

        // Draw lanes

        task1.add(function (task1) {
            if (!laneSets) laneSets = [];
        });

        for (var i in laneSets) {
            var laneSet = laneSets[i];
            //laneSet.id, laneSet.name

            task1.add(laneSet.lanes, function (task1, lane) {
                progress += step;
                pb1.set('value', parseInt(progress));

                processDiagramCanvas.drawPoolOrLane(lane.x, lane.y, lane.width, lane.height, lane.name);
            });
        }

        // Draw activities

        task1.add(function (task1) {
            if (!activities) activities = [];
        });

        var activitiesLength = activities.length;
        task1.add(activities, function (task1, activityJson) {
            var activity = new ActivityImpl(activityJson);
            activitiesLength--;
            progress += step;
            pb1.set('value', parseInt(progress));
            ProcessDiagramGenerator.drawActivity(processDiagramCanvas, activity);
        });

        // Draw sequence-flows

        task1.add(function (task1) {
            if (!sequenceFlows) sequenceFlows = [];
        });

        var flowsLength = sequenceFlows.length;
        task1.add(sequenceFlows, function (task1, flow) {
            var waypoints = [];
            for (var j in flow.xPointArray) {
                waypoints[j] = { x: flow.xPointArray[j], y: flow.yPointArray[j] };
            }
            var isDefault = flow.isDefault;
            var isConditional = flow.isConditional;
            var isHighLighted = flow.isHighLighted;

            // TODO: add source and destination for sequence flows in REST
            // parse for test
            var f = flow.flow;
            var matches = f.match(/\((.*)\)--.*-->\((.*)\)/);
            var sourceActivityId, destinationActivityId;
            if (matches != null) {
                sourceActivityId = matches[1];
                destinationActivityId = matches[2];
            }
            flow.sourceActivityId = sourceActivityId;
            flow.destinationActivityId = destinationActivityId;
            flowsLength--;
            progress += step;
            pb1.set('value', parseInt(progress));

            processDiagramCanvas.setConextObject(flow);
            processDiagramCanvas.drawSequenceflow(waypoints, isConditional, isDefault, isHighLighted);
        });

        task1.onComplete(function () {
            if (progress < 100) pb1.set('value', 100);
        });

        task1.run();
    },

    getProcessDiagram: function (processDefinitionId) {
        return this.processDiagrams[processDefinitionId];
    },

    initProcessDiagramCanvas: function (processDefinitionDiagramLayout) {
        var minX = 0;
        var maxX = 0;
        var minY = 0;
        var maxY = 0;

        if (processDefinitionDiagramLayout.participantProcess != undefined) {
            var pProc = processDefinitionDiagramLayout.participantProcess;

            minX = pProc.x;
            maxX = pProc.x + pProc.width;
            minY = pProc.y;
            maxY = pProc.y + pProc.height;
        }

        var activities = processDefinitionDiagramLayout.activities;
        for (var i in activities) {
            var activityJson = activities[i];
            var activity = new ActivityImpl(activityJson);

            // width
            if (activity.getX() + activity.getWidth() > maxX) {
                maxX = activity.getX() + activity.getWidth();
            }
            if (activity.getX() < minX) {
                minX = activity.getX();
            }
            // height
            if (activity.getY() + activity.getHeight() > maxY) {
                maxY = activity.getY() + activity.getHeight();
            }
            if (activity.getY() < minY) {
                minY = activity.getY();
            }
        }

        var sequenceFlows = processDefinitionDiagramLayout.sequenceFlows;
        for (var i in sequenceFlows) {
            var flow = sequenceFlows[i];
            var waypoints = [];
            for (var j in flow.xPointArray) {
                waypoints[j] = { x: flow.xPointArray[j], y: flow.yPointArray[j] };

                // width
                if (waypoints[j].x > maxX) {
                    maxX = waypoints[j].x;
                }
                if (waypoints[j].x < minX) {
                    minX = waypoints[j].x;
                }
                // height
                if (waypoints[j].y > maxY) {
                    maxY = waypoints[j].y;
                }
                if (waypoints[j].y < minY) {
                    minY = waypoints[j].y;
                }
            }
        }

        var laneSets = processDefinitionDiagramLayout.laneSets;
        for (var i in laneSets) {
            var laneSet = laneSets[i];
            //laneSet.id, laneSet.name

            for (var j in laneSet.lanes) {
                var lane = laneSet.lanes[j];
                // width
                if (lane.x + lane.width > maxX) {
                    maxX = lane.x + lane.width;
                }
                if (lane.x < minX) {
                    minX = lane.x;
                }
                // height
                if (lane.y + lane.height > maxY) {
                    maxY = lane.y + lane.height;
                }
                if (lane.y < minY) {
                    minY = lane.y;
                }
            }
        }

        var $wrapper = $('.wrapper');
        var offsetH = ($wrapper.height() - Math.abs(maxY - minY)) / 2;
        var offsetW = ($wrapper.width() - Math.abs(maxX - minX)) / 2;
        offsetH = offsetH < 0 ? 0 : offsetH;
        offsetW = offsetW < 0 ? 0 : offsetW;
        for (var i in activities) {
            var activityJson = activities[i];
            var activity = new ActivityImpl(activityJson);
            activityJson.y = activity.getY() - minY + offsetH;
            activityJson.x = activity.getX() - minX + offsetW;
        }
        for (var i in sequenceFlows) {
            var flow = sequenceFlows[i];
            flow.y = flow.y - minY;
            for (var j in flow.xPointArray) {
                flow.xPointArray[j] = flow.xPointArray[j] - minX + offsetW;
            }
            for (var j in flow.yPointArray) {
                flow.yPointArray[j] = flow.yPointArray[j] - minY + offsetH;
            }
        }

        for (var i in laneSets) {
            var laneSet = laneSets[i];
            laneSet.y = laneSet.y - minY + offsetH;
            laneSet.x = laneSet.x - minX + offsetW;
        }

        var diagramCanvas = new ProcessDiagramCanvas();
        if (diagramCanvas) {
            // create div in diagramHolder
            var diagramHolder = document.getElementById(this.options.diagramHolderId);
            if (!diagramHolder) throw { msg: 'Diagram holder not found', error: 'diagramHolderNotFound' };
            var div = document.createElement('DIV');
            div.id = processDefinitionDiagramLayout.processDefinition.id;
            //div.className = "diagram";
            diagramHolder.appendChild(div);

            diagramCanvas.init(
                maxX - minX + offsetW + 150,
                maxY - minY + offsetH + 150,
                processDefinitionDiagramLayout.processDefinition.id
            );
            this.processDiagrams[processDefinitionDiagramLayout.processDefinition.id] = {
                processDefinitionDiagramLayout: processDefinitionDiagramLayout,
                diagramCanvas: diagramCanvas
            };
        }
        return this.getProcessDiagram(processDefinitionDiagramLayout.processDefinition.id);
        //return new DefaultProcessDiagramCanvas(maxX + 10, maxY + 10, minX, minY);
    },

    drawActivity: function (processDiagramCanvas, activity, highLightedActivities) {
        var type = activity.getProperty('type');
        var drawInstruction = this.activityDrawInstructions[type];
        if (drawInstruction != null) {
            drawInstruction.apply({ processDiagramCanvas: processDiagramCanvas, activity: activity });
        } else {
            //
        }

        // Actually draw the markers
        if (activity.getProperty('multiInstance') != undefined || activity.getProperty('collapsed') != undefined) {
            var multiInstanceSequential = activity.getProperty('multiInstance') == 'sequential';
            var multiInstanceParallel = activity.getProperty('multiInstance') == 'parallel';
            var collapsed = activity.getProperty('collapsed');
            processDiagramCanvas.drawActivityMarkers(
                activity.getX(),
                activity.getY(),
                activity.getWidth(),
                activity.getHeight(),
                multiInstanceSequential,
                multiInstanceParallel,
                collapsed
            );
        }
        /*
        processDiagramCanvas.drawActivityMarkers(activity.getX(), activity.getY(), activity.getWidth(), activity.getHeight(), multiInstanceSequential,
              multiInstanceParallel, collapsed);
        */

        // TODO: Draw highlighted activities if they are present
    },

    setHighLights: function (highLights) {
        if (highLights.processDefinitionId == undefined) {
            // 流程结束的标志
            var processDiagram = this.getProcessDiagram(window.processId);
            var processDiagramCanvas = processDiagram.diagramCanvas;
            var flows = window.completeData;
            for (var i in window.completeData) {
                var flowId = flows[i];
                var object = processDiagramCanvas.g.getById(flowId);
                var flow = object.data('contextObject');
                flow.isHighLighted = true;
                processDiagramCanvas.highLightFlow(flowId);
            }
            //
            return;
        }

        var processDiagram = this.getProcessDiagram(highLights.processDefinitionId);
        if (processDiagram == undefined) {
            //
            return;
        }

        var processDiagramCanvas = processDiagram.diagramCanvas;

        // TODO: remove highLightes from all activities before set new highLight
        for (var i in highLights.activities) {
            var activityId = highLights.activities[i];
            processDiagramCanvas.highLightActivity(activityId);
        }

        // TODO: remove highLightes from all flows before set new highLight
        for (var i in highLights.flows) {
            var flowId = highLights.flows[i];
            var object = processDiagramCanvas.g.getById(flowId);
            var flow = object.data('contextObject');
            flow.isHighLighted = true;
            processDiagramCanvas.highLightFlow(flowId);
        }
    },

    drawHighLights: function (processInstanceId) {
        // Load highLights for the processInstanceId
        /*
        var url = Lang.sub(this.options.processInstanceHighLightsUrl, {processInstanceId: processInstanceId});
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            cache: false,
            async: true,
        }).done(function(data) {
            var highLights = data;
            if (!highLights) {

                return;
            }



            ProcessDiagramGenerator.setHighLights(highLights);
        }).fail(function(jqXHR, textStatus){

        });
        */
        ActivitiRest.getHighLights(processInstanceId, this._drawHighLights);
    },
    _drawHighLights: function () {
        var highLights = this.highLights;
        ProcessDiagramGenerator.setHighLights(highLights);
    },

    // Load processDefinition

    drawDiagram: function (processDefinitionId, processInstanceId) {
        // Hide all diagrams
        var diagrams = $('#' + this.options.diagramHolderId + ' div.diagram');
        diagrams.addClass('hidden');

        // If processDefinitionId doesn't contain ":" then it's a "processDefinitionKey", not an id.
        // Get process definition by key
        if (processDefinitionId.indexOf(':') < 0) {
            ActivitiRest.getProcessDefinitionByKey(processDefinitionId, this._generateDiagram);
        } else {
            this._drawDiagram.apply({ processDefinitionId: processDefinitionId, processInstanceId: processInstanceId });
        }
    },
    _drawDiagram: function () {
        var processDefinitionId = this.processDefinitionId;
        var processInstanceId = this.processInstanceId;

        ProcessDiagramGenerator.addBreadCrumbsItem(processDefinitionId);

        // Check if processDefinition is already loaded and rendered

        var processDiagram = ProcessDiagramGenerator.getProcessDiagram(processDefinitionId);

        if (processDiagram != undefined && processDiagram != null) {
            //return;

            var diagram = document.getElementById(processDefinitionId);
            $(diagram).removeClass('hidden');

            // Regenerate image
            var processDefinitionDiagramLayout = processDiagram.processDefinitionDiagramLayout;
            ProcessDiagramGenerator.generateDiagram(processDefinitionDiagramLayout);

            return;
        }

        //

        // Load processDefinition

        ActivitiRest.getProcessDefinition(
            processDefinitionId,
            processInstanceId,
            ProcessDiagramGenerator._generateDiagram
        );
        if (window.require('erdcloud.router')?.matched?.[1]?.name === 'processManage') {
            ActivitiRest.getInterfaces(processDefinitionId, processInstanceId);
        }
    },
    _generateDiagram: function () {
        var processDefinitionDiagramLayout = this.processDefinitionDiagramLayout;
        pb1.set('value', 0);
        ProcessDiagramGenerator.generateDiagram(processDefinitionDiagramLayout);
    },

    getProcessDefinitionByKey: function (processDefinitionKey) {
        var url = Lang.sub(this.options.processDefinitionByKeyUrl, { processDefinitionKey: processDefinitionKey });

        var processDefinition;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            cache: false,
            async: false,
            headers: {
                'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
            }
        })
            .done(function (data) {
                processDefinition = data;
                if (!processDefinition) {
                    //
                }
            })
            .fail(function (jqXHR, textStatus) {
                //
            });

        if (processDefinition) {
            return processDefinition;
        } else {
            return null;
        }
    },

    addBreadCrumbsItem: function (processDefinitionId) {
        var TPL_UL_CONTAINER = '<ul></ul>',
            TPL_LI_CONTAINER = '<li id="{id}", processDefinitionId="{processDefinitionId}"><span>{name}</span></li>';

        if (!this.diagramBreadCrumbs) this.diagramBreadCrumbs = $('#' + this.options.diagramBreadCrumbsId);
        if (!this.diagramBreadCrumbs) return;

        var ul = this.diagramBreadCrumbs.find('ul');
        if (ul.size() == 0) {
            ul = $(TPL_UL_CONTAINER);
            this.diagramBreadCrumbs.append(ul);
        }
        var liListOld = ul.find('li');
        //

        // TODO: if there is any items after current then remove that before adding new item (m.b. it is a duplicate)
        var currentBreadCrumbsItemId = this.currentBreadCrumbsItemId;
        found = false;
        liListOld.each(function (index, item) {
            //
            if (!found && currentBreadCrumbsItemId == $(this).attr('id')) {
                found = true;
                return;
            }
            if (found) {
                //
                $(this).remove();
            }
        });

        var liListNew = ul.find('li');

        var values = {
            id: 'breadCrumbsItem_' + liListNew.size(),
            processDefinitionId: processDefinitionId,
            name: processDefinitionId
        };

        var tpl = Lang.sub(TPL_LI_CONTAINER, values);
        ul.append(tpl);

        var li = ul.find('#' + values.id);
        //
        $('#' + values.id).on('click', this._breadCrumbsItemClick);

        ul.find('li').removeClass('selected');
        li.attr('num', liListNew.size());
        li.addClass('selected');
        this.currentBreadCrumbsItemId = li.attr('id');
    },
    _breadCrumbsItemClick: function () {
        var li = $(this),
            id = li.attr('id'),
            processDefinitionId = li.attr('processDefinitionId');
        //

        var ul = ProcessDiagramGenerator.diagramBreadCrumbs.one('ul');
        ul.find('li').removeClass('selected');
        li.addClass('selected');
        ProcessDiagramGenerator.currentBreadCrumbsItemId = li.attr('id');

        // Hide all diagrams
        var diagrams = $('#' + ProcessDiagramGenerator.options.diagramHolderId + ' div.diagram');
        diagrams.addClass('hidden');

        var processDiagram = ProcessDiagramGenerator.getProcessDiagram(processDefinitionId);

        var diagram = document.getElementById(processDefinitionId);
        if (!diagram) return;
        $(diagram).removeClass('hidden');

        // Regenerate image
        var processDefinitionDiagramLayout = processDiagram.processDefinitionDiagramLayout;
        ProcessDiagramGenerator.generateDiagram(processDefinitionDiagramLayout);
    },

    showFlowInfo: function (flow) {
        var diagramInfo = $('#' + this.options.diagramInfoId);
        if (!diagramInfo) return;

        var values = {
            flow: flow.flow,
            isDefault: flow.isDefault ? 'true' : '',
            isConditional: flow.isConditional ? 'true' : '',
            isHighLighted: flow.isHighLighted ? 'true' : '',
            sourceActivityId: flow.sourceActivityId,
            destinationActivityId: flow.destinationActivityId
        };
        // var TPL_FLOW_INFO = '<div>{flow}</div>'
        // 		+ '<div><b>sourceActivityId</b>: {sourceActivityId}</div>'
        // 		+ '<div><b>destinationActivityId</b>: {destinationActivityId}</div>'
        // 		+ '<div><b>isDefault</b>: {isDefault}</div>'
        // 		+ '<div><b>isConditional</b>: {isConditional}</div>'
        // 		+ '<div><b>isHighLighted</b>: {isHighLighted}</div>';
        // var tpl = Lang.sub(TPL_FLOW_INFO, values);
        //diagramInfo.html(tpl);
    },

    showActivityInfo: function (activity, canvas) {
        var processDiagram = ProcessDiagramGenerator.getProcessDiagram(canvas.processDefinitionId),
            diagramInfo = $('#' + this.options.diagramInfoId);
        if (!diagramInfo) return;

        var values = {
                activityId: activity.getId(),
                name: activity.getProperty('name'),
                type: activity.getProperty('type')
            },
            processDefinitionDiagramLayout = processDiagram.processDefinitionDiagramLayout,
            users = processDefinitionDiagramLayout.users || [],
            roleList = processDefinitionDiagramLayout.roleList,
            roleData = processDefinitionDiagramLayout.activities,
            taskComments = activity.properties.taskComments,
            getInterface = window.getInterfaces || [],
            TPL_ACTIVITY_INFO = '',
            roleCode = '',
            roleInfo = [],
            roleName = '',
            interfacesInfo = [];
        if (taskComments != undefined) {
            for (var i = 0; i < taskComments.length; i++) {
                var record = taskComments[i],
                    username = '';
                for (var k = 0; k < users.length; k++) {
                    var user = users[k],
                        userId = record.userId;
                    if (userId == undefined) {
                        continue;
                    }
                    var userIdarr = userId.split(',');
                    for (var j = 0; j < userIdarr.length; j++) {
                        var id = userIdarr[j];
                        if (user.oid === id || (user.oid).indexOf(id) >= 0) {
                            username += user.displayName + '（' + user.email + ' ）' + ';</br>';
                        }
                    }
                }
                if (record.time == undefined) {
                    if (username.length > 0) {
                        TPL_ACTIVITY_INFO += '<div><b>处理人</b>:</br> ' + username + '</div></br>';
                    }
                } else {
                    var approvalResult = record.approvalResult == undefined ? '提交' : record.approvalResult;
                    TPL_ACTIVITY_INFO +=
                        '<div><b>处理人</b>: ' +
                        username +
                        '</div>' +
                        '<div><div><b>审批结果</b>: ' +
                        approvalResult +
                        '</div><b>处理时间</b>: ' +
                        new Date(record.time).toLocaleString() +
                        '</div><div><b>处理意见</b>:' +
                        record.fullMessage +
                        '</div></br>';
                }
            }
        }
        for (var i = 0; i < roleData.length; i++) {
            if (roleData[i].activityId == values.activityId) {
                roleCode = roleData[i].candidateGroups;
            }
        }
        if (roleCode) {
            roleCode = roleCode.split(',');
            for (var j = 0; j < roleCode.length; j++) {
                for (var i = 0; i < roleList.length; i++) {
                    if (roleCode[j] == roleList[i].code) {
                        roleInfo.push(roleList[i]);
                        break;
                    }
                }
            }
            for (var i = 0; i < roleInfo.length; i++) {
                roleName += roleInfo[i].name + '</br>';
            }
        }
        if (roleName) {
            if (taskComments != undefined && taskComments[0].time == undefined) {
                TPL_ACTIVITY_INFO += '<div><b>处理人角色</b>:</br> ' + roleName + '</div>';
            }
        }

        // 流程实例页面中的流程图还会出现接口信息，暂时屏蔽
        // window.top.$.form.getMenuInfo().l2Code === 'workflowManagement:instance'
        if (getInterface && getInterface.length > 0 && false) {
            for (var i = 0; i < getInterface.length; i++) {
                if (getInterface[i].activityId == values.activityId) {
                    for (var j = 0; j < getInterface[i].invokeResult.length; j++) {
                        interfacesInfo.push(getInterface[i].invokeResult[j]);
                    }
                }
            }
        }
        if (interfacesInfo && interfacesInfo.length) {
            TPL_ACTIVITY_INFO +=
                '<table id="interfaceTable" border="1" cellspacing="0" cellpadding="0">' +
                '<tr class="interfaceHeader"><td>接口名称</td><td>接口信息</td><td>接口状态</td></tr>';
            for (var i = 0; i < interfacesInfo.length; i++) {
                TPL_ACTIVITY_INFO +=
                    '<tr><td>' +
                    interfacesInfo[i].interfaceName +
                    '</td><td>' +
                    interfacesInfo[i].message +
                    '</td><td>' +
                    interfacesInfo[i].success +
                    '</td></tr>';
            }
            TPL_ACTIVITY_INFO += '</table></br>';
        }
        var tpl = Lang.sub(TPL_ACTIVITY_INFO, values);
        var diagramInfo = $('#diagramInfo');
        diagramInfo.html(tpl);
        ProcessDiagramGenerator.show(activity, 'diagramInfo');
    },

    show: function (obj, id) {
        var objDiv = $('#' + id + '');
        $(objDiv).css('display', 'block');
        $(objDiv).css('left', obj.x + 110);
        $(objDiv).css('top', obj.y);
    },

    hide: function (id) {
        var objDiv = $('#' + id + '');
        $(objDiv).css('display', 'none');
    },

    hideInfo: function () {
        var diagramInfo = $('#' + this.options.diagramInfoId);
        if (!diagramInfo) return;
        diagramInfo.html('');
    },

    vvoid: function () {}
};

var Lang = {
    SUBREGEX: /\{\s*([^\|\}]+?)\s*(?:\|([^\}]*))?\s*\}/g,
    UNDEFINED: 'undefined',
    isUndefined: function (o) {
        return typeof o === Lang.UNDEFINED;
    },
    sub: function (s, o) {
        return s.replace
            ? s.replace(Lang.SUBREGEX, function (match, key) {
                  return !Lang.isUndefined(o[key]) ? o[key] : match;
              })
            : s;
    }
};

if (Lang.isUndefined(console)) {
    console = { log: function () {}, warn: function () {}, error: function () {} };
}
ProcessDiagramGenerator.init();
