import * as Component from "@egjs/component";
import {AnimationManager} from "./AnimationManager";
import {EventManager} from "./EventManager";
import {InterruptManager} from "./InterruptManager";
import {AxisManager, Axis} from "./AxisManager";
import {InputObserver} from "./InputObserver";
import {PanInput} from "./inputType/PanInput";
import {PinchInput} from "./inputType/PinchInput";
import {TRANSFORM, DIRECTION} from "./const";
import {IInputType} from "./inputType/InputType";

/**
 * @typedef {Object} AxisOption The Axis information
 * @ko 축 정보
 * @property {Number[]} [range] The coordinate of range <ko>좌표 범위</ko>
 * @property {Number} [range.0=0] The coordinate of the minimum <ko>최소 좌표</ko>
 * @property {Number} [range.1=0] The coordinate of the maximum <ko>최대 좌표</ko>
 * @property {Number[]} [bounce] The size of bouncing area. The coordinates can exceed the coordinate area as much as the bouncing area based on user action. If the coordinates does not exceed the bouncing area when an element is dragged, the coordinates where bouncing effects are applied are retuned back into the coordinate area<ko>바운스 영역의 크기. 사용자의 동작에 따라 좌표가 좌표 영역을 넘어 바운스 영역의 크기만큼 더 이동할 수 있다. 사용자가 끌어다 놓는 동작을 했을 때 좌표가 바운스 영역에 있으면, 바운스 효과가 적용된 좌표가 다시 좌표 영역 안으로 들어온다</ko>
 * @property {Number} [bounce.0=0] The size of coordinate of the minimum area <ko>최소 좌표 바운스 영역의 크기</ko>
 * @property {Number} [bounce.1=0] The size of coordinate of the maximum area <ko>최대 좌표 바운스 영역의 크기</ko>
 * @property {Boolean[]} [circular] Indicates whether a circular element is available. If it is set to "true" and an element is dragged outside the coordinate area, the element will appear on the other side.<ko>순환 여부. 'true'로 설정한 방향의 좌표 영역 밖으로 엘리먼트가 이동하면 반대 방향에서 엘리먼트가 나타난다</ko>
 * @property {Boolean} [circular.0=false] Indicates whether to circulate to the coordinate of the minimum <ko>최소 좌표 방향의 순환 여부</ko>
 * @property {Boolean} [circular.1=false] Indicates whether to circulate to the coordinate of the maximum <ko>최대 좌표 방향의 순환 여부</ko>
**/

/**
 * @typedef {Object} AxesOption The option object of the eg.Axes module
 * @ko eg.Axes 모듈의 옵션 객체
 * @property {Function} [easing=easing.easeOutCubic] The easing function to apply to an animation <ko>애니메이션에 적용할 easing 함수</ko>
 * @property {Number} [maximumDuration=Infinity] Maximum duration of the animation <ko>가속도에 의해 애니메이션이 동작할 때의 최대 좌표 이동 시간</ko>
 * @property {Number} [deceleration=0.0006] Deceleration of the animation where acceleration is manually enabled by user. A higher value indicates shorter running time. <ko>사용자의 동작으로 가속도가 적용된 애니메이션의 감속도. 값이 높을수록 애니메이션 실행 시간이 짧아진다</ko>
 * @property {Object.<string, AxisOption>} [axis={}] Axis information managed by eg.Axes <ko>eg.Axes가 관리하는 축 정보</ko>
 * @property {Boolean} [interruptable=true] Indicates whether an animation is interruptible.<br>- true: It can be paused or stopped by user action or the API.<br>- false: It cannot be paused or stopped by user action or the API while it is running.<ko>진행 중인 애니메이션 중지 가능 여부.<br>- true: 사용자의 동작이나 API로 애니메이션을 중지할 수 있다.<br>- false: 애니메이션이 진행 중일 때는 사용자의 동작이나 API가 적용되지 않는다</ko>
**/

/**
 * @class eg.Axes
 * @classdesc A module used to change the information of user action entered by various input devices such as touch screen or mouse into logical coordinates within the virtual coordinate system. The coordinate information sorted by time events occurred is provided if animations are made by user actions.
 * @ko 터치 입력 장치나 마우스와 같은 다양한 입력 장치로 전달 받은 사용자의 동작을 가상 좌표계의 논리적 좌표로 변경하는 모듈. 사용자의 동작으로 애니메이션이 일어나면 시간순으로 변경되는 좌표 정보도 제공한다. 변경된 논리적 좌표를 반영해 UI를 구현할 수 있다.
 * @extends eg.Component
 *
 * @param {AxesOption} [options] The option object of the eg.Axes module<ko>eg.Axes 모듈의 옵션 객체</ko>
 *
 * @support {"ie": "10+", "ch" : "latest", "ff" : "latest",  "sf" : "latest", "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 * @example
 * const axes = new eg.Axes({
 *	axis: {
 *		x: {
 *			range: [0, 150],
 *			bounce: 50
 *		},
 *		y: {
 *			range: [0, 200],
 *			bounce: 100
 *		},
 *		z: {
 *			range: [1, 10],
 *		}
 *	},
 *  deceleration : 0.0024
 *}).on({
 *	"hold" : function(evt) {
 *	},
 *	"release" : function(evt) {
 *	},
 *	"animationStart" : function(evt) {
 *	},
 *	"animationEnd" : function(evt) {
 *	},
 *	"change" : function(evt) {
 *	}
 *});
 *
 *const panInputArea = new eg.Axes.PanInput("#area", {
 *	scale: [0.5, 1]
 *});
 *const panInputHmove = new eg.Axes.PanInput("#hmove");
 *const panInputVmove = new eg.Axes.PanInput("#vmove");
 *const pinchInputArea = new eg.Axes.PinchInput("#area", {
 *	scale: 1.5
 *});
 *
 *axes.connect("x y", panInputArea)
 *	.connect("x", panInputHmove)
 *	.connect(" y", panInputVmove)
 *	.connect("z", pinchInputArea);
 */
export default class Axes extends Component {
	static VERSION = "#__VERSION__#";
	static PanInput = PanInput;
	static PinchInput = PinchInput;

	/**
	 * @name eg.Axes.TRANSFORM
	 * @desc Returns the transform attribute with CSS vendor prefixes.
	 * @ko CSS vendor prefixes를 붙인 transform 속성을 반환한다.
	 *
	 * @constant
	 * @type {String}
	 * @example
	 * eg.Axes.TRANSFORM; // "transform" or "webkitTransform"
	 */
	static TRANSFORM = TRANSFORM;
	/**
	 * @name eg.Axes.DIRECTION_NONE
	 * @constant
	 * @type {Number}
	 */
	static DIRECTION_NONE = DIRECTION.DIRECTION_NONE;
	/**
	 * @name eg.Axes.DIRECTION_LEFT
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_LEFT = DIRECTION.DIRECTION_LEFT;
	/**
	 * @name eg.Axes.DIRECTION_RIGHT
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_RIGHT = DIRECTION.DIRECTION_RIGHT;
	/**
	 * @name eg.Axes.DIRECTION_UP
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_UP = DIRECTION.DIRECTION_UP;
	/**
	 * @name eg.Axes.DIRECTION_DOWN
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_DOWN = DIRECTION.DIRECTION_DOWN;
	/**
	 * @name eg.Axes.DIRECTION_HORIZONTAL
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_HORIZONTAL = DIRECTION.DIRECTION_HORIZONTAL;
	/**
	 * @name eg.Axes.DIRECTION_VERTICAL
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_VERTICAL = DIRECTION.DIRECTION_VERTICAL;
	/**
	 * @name eg.Axes.DIRECTION_ALL
	 * @constant
	 * @type {Number}
	*/
	static DIRECTION_ALL = DIRECTION.DIRECTION_ALL;

	options: AxesOption;
	private _em: EventManager;
	private _axm: AxisManager;
	private _itm: InterruptManager;
	private _am: AnimationManager;
	private _io: InputObserver;
	private _inputs: IInputType[] = [];

	constructor(options: AxesOption) {
		super();
		this.options = { ...{
			easing: function easeOutCubic(x) {
				return 1 - Math.pow(1 - x, 3);
			},
			interruptable: true,
			maximumDuration: Infinity,
			deceleration: 0.0006,
			axis: {},
		}, ...options};

		this._complementOptions();
		this._em = new EventManager(this);
		this._axm = new AxisManager(this.options);
		this._itm = new InterruptManager(this.options);
		this._am = new AnimationManager(this.options, this._itm, this._em, this._axm);
		this._io = new InputObserver(this.options, this._itm, this._em, this._axm, this._am);
	}

	/**
	 * set up 'css' expression
	 * @private
	 */
	private _complementOptions() {
		Object.keys(this.options.axis).forEach(axis => {
			this.options.axis[axis] = { ...{
				range: [0, 100],
				bounce: [0, 0],
				circular: [false, false]
			}, ...this.options.axis[axis]};

			["bounce", "circular"].forEach(v => {
				const axisOption = this.options.axis;
				const key = axisOption[axis][v];

				if (/string|number|boolean/.test(typeof key)) {
					axisOption[axis][v] = [key, key];
				}
			});
		});
	}

	/**
	 * Connect the axis of eg.Axes to the inputType.
	 * @ko eg.Axes의 축과 inputType을 연결한다
	 * @method eg.Axes#connect
	 * @param {(String[]|String)} axes The name of the axis to associate with inputType <ko>inputType과 연결할 축의 이름</ko>
	 * @param {Object} inputType The inputType instance to associate with the axis of eg.Axes <ko>eg.Axes의 축과 연결할 inputType 인스턴스<ko>
	 * @return {eg.Axes} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     }
	 *   }
	 * });
	 *
	 * axes.connect("x", new eg.Axes.PanInput("#area1"))
	 *    .connect("x xOther", new eg.Axes.PanInput("#area2"))
	 *    .connect(" xOther", new eg.Axes.PanInput("#area3"))
	 *    .connect(["x"], new eg.Axes.PanInput("#area4"))
	 *    .connect(["xOther", "x"], new eg.Axes.PanInput("#area5"))
	 *    .connect(["", "xOther"], new eg.Axes.PanInput("#area6"));
	 */
	connect(axes: string[] | string, inputType: IInputType) {
		let mapped;
		if (typeof axes === "string") {
			mapped = axes.split(" ");
		} else {
			mapped = axes.concat();
		}

		// check same instance
		if (~this._inputs.indexOf(inputType)) {
			this.disconnect(inputType);
		}

		// check same element in hammer type for share
		if ("hammer" in inputType) {
			const targets = this._inputs.filter(v => v.hammer && v.element === inputType.element);
			if (targets.length) {
				inputType.hammer = targets[0].hammer;
			}
		}
		inputType.mapAxes(mapped);
		inputType.connect(this._io);
		this._inputs.push(inputType);
		return this;
	}
	/**
	 * Disconnect the axis of eg.Axes from the inputType.
	 * @ko eg.Axes의 축과 inputType의 연결을 끊는다.
	 * @method eg.Axes#disconnect
	 * @param {Object} [inputType] An inputType instance associated with the axis of eg.Axes <ko>eg.Axes의 축과 연결한 inputType 인스턴스<ko>
	 * @return {eg.Axes} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     }
	 *   }
	 * });
	 *
	 * const input1 = new eg.Axes.PanInput("#area1");
	 * const input2 = new eg.Axes.PanInput("#area2");
	 * const input3 = new eg.Axes.PanInput("#area3");
	 *
	 * axes.connect("x", input1);
	 *    .connect("x xOther", input2)
	 *    .connect(["xOther", "x"], input3);
	 *
	 * axes.disconnect(input1); // disconnects input1
	 * axes.disconnect(); // disconnects all of them
	 */
	disconnect(inputType?: IInputType) {
		if (inputType) {
			const index = this._inputs.indexOf(inputType);
			this._inputs[index].disconnect();
			~index && this._inputs.splice(index, 1);
		} else {
			this._inputs.forEach(v => v.disconnect());
			this._inputs = [];
		}
		return this;
	}

	/**
	 * Returns the current position of the coordinates.
	 * @ko 좌표의 현재 위치를 반환한다
	 * @method eg.Axes#get
	 * @param {Object} [axes] The names of the axis <ko>축 이름들</ko>
	 * @return {Object.<string, number>} Axis coordinate information <ko>축 좌표 정보</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     },
	 * 		 "zoom": {
	 *        range: [50, 30]
	 *     }
	 *   }
	 * });
	 *
	 * axes.get(); // {"x": 0, "xOther": -100, "zoom": 50}
	 * axes.get(["x", "zoom"]); // {"x": 0, "zoom": 50}
	 */
	get(axes?: string[]) {
		return this._axm.get(axes);
	}

	/**
	 * Moves an axis to specific coordinates.
	 * @ko 좌표를 이동한다.
	 * @method eg.Axes#setTo
	 * @param {Object.<string, number>} pos The coordinate to move to <ko>이동할 좌표</ko>
	 * @param {Number} [duration=0] Duration of the animation (unit: ms) <ko>애니메이션 진행 시간(단위: ms)</ko>
	 * @return {eg.Axes} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     },
	 * 		 "zoom": {
	 *        range: [50, 30]
	 *     }
	 *   }
	 * });
	 *
	 * axes.setTo({"x": 30, "zoom": 60});
	 * axes.get(); // {"x": 30, "xOther": -100, "zoom": 60}
	 *
	 * axes.setTo({"x": 100, "xOther": 60}, 1000); // animatation
	 *
	 * // after 1000 ms
	 * axes.get(); // {"x": 100, "xOther": 60, "zoom": 60}
	 */
	setTo(pos: Axis, duration = 0) {
		this._am.setTo(pos, duration);
		return this;
	}

	/**
	 * Moves an axis from the current coordinates to specific coordinates.
	 * @ko 현재 좌표를 기준으로 좌표를 이동한다.
	 * @method eg.Axes#setBy
	 * @param {Object.<string, number>} pos The coordinate to move to <ko>이동할 좌표</ko>
	 * @param {Number} [duration=0] Duration of the animation (unit: ms) <ko>애니메이션 진행 시간(단위: ms)</ko>
	 * @return {eg.Axes} An instance of a module itself <ko>모듈 자신의 인스턴스</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     },
	 * 		 "zoom": {
	 *        range: [50, 30]
	 *     }
	 *   }
	 * });
	 *
	 * axes.setBy({"x": 30, "zoom": 10});
	 * axes.get(); // {"x": 30, "xOther": -100, "zoom": 60}
	 *
	 * axes.setBy({"x": 70, "xOther": 60}, 1000); // animatation
	 *
	 * // after 1000 ms
	 * axes.get(); // {"x": 100, "xOther": -40, "zoom": 60}
	 */
	setBy(pos: Axis, duration = 0) {
		this._am.setBy(pos, duration);
		return this;
	}

	/**
	 * Returns whether there is a coordinate in the bounce area of ​​the target axis.
	 * @ko 대상 축 중 bounce영역에 좌표가 존재하는지를 반환한다
	 * @method eg.Axes#isBounceArea
	 * @param {Object} [axes] The names of the axis <ko>축 이름들</ko>
	 * @return {Boolen} Whether the bounce area exists. <ko>bounce 영역 존재 여부</ko>
	 * @example
	 * const axes = new eg.Axes({
	 *   axis: {
	 *     "x": {
	 *        range: [0, 100]
	 *     },
	 *     "xOther": {
	 *        range: [-100, 100]
	 *     },
	 *     "zoom": {
	 *        range: [50, 30]
	 *     }
	 *   }
	 * });
	 *
	 * axes.isBounceArea(["x"]);
	 * axes.isBounceArea(["x", "zoom"]);
	 * axes.isBounceArea();
	 */
	isBounceArea(axes?: string[]) {
		return this._axm.isOutside(axes);
	}

	/**
	* Destroys properties, and events used in a module and disconnect all connections to inputTypes.
	* @ko 모듈에 사용한 속성, 이벤트를 해제한다. 모든 inputType과의 연결을 끊는다.
	* @method eg.Axes#destroy
	*/
	destroy() {
		this.disconnect();
		this._em.destroy();
	}
};
