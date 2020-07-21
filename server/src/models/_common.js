const mongoose = require('mongoose');

/**
 * 通过在数据库中创建计数器集合来初始化插件
 */
const IdentityCounterSchema = new mongoose.Schema({
	model: { type: String, require: true },
	field: { type: String, require: true },
	count: { type: Number, default: 0 }
});

// 使用“字段”和“模型”字段创建唯一的索引。
IdentityCounterSchema.index({ 
	field: 1, 
	model: 1 
}, { 
	unique: true, 
	required: true, 
	index: -1 
});

const IdentityCounter = mongoose.model('IdentityCounter', IdentityCounterSchema);

/**
 * 在调用自定义模式上的插件时使用的函数
 *
 * schema.plugin(
 * 	IncrementPlugin, { 
 * 		model: 'model name', 
 * 		field: '_id', 
 * 		startAt: 11, 
 * 		incrementBy: 1
 * 	});
 */
const IncrementPlugin = (schema, options) => {
	// 默认设置和插件范围变量
	let settings = {
		// 模型
		model: null,
		// 插件应该跟踪的字段
		field: '_id',
		// 计数的起始数。
		startAt: 0,
		// 每次使计数递增的数
		incrementBy: 1,
		// 是否创建一个惟一的索引
		unique: true
	};

	let fields = {}; // 要在Mongoose中添加属性的字段散列
	let ready = false; // 如果计数器集合已更新且文档已准备好保存，则为True。

	switch (typeof options) {
		case 'string':
			settings.model = options;
			break;
		case 'object':
			settings = Object.assign(settings, options);
			break;
		default:
			break;
	}

	if (settings.model == null) {
		throw new Error("模型必须是设置");
	}

	// 为模型添加属性
	fields[settings.field] = {
		type: Number,
		require: true
	};
	if (settings.field !== '_id') {
		fields[settings.field].unique = settings.unique;
	}

	schema.add(fields);

	// 查找此模型的计数器和相关字段.
	IdentityCounter.findOne(
		{ model: settings.model, field: settings.field },
		(err, counter) => {
			if (!counter) {
				// 如果不存在计数器，则创建一个并保存它
				counter = new IdentityCounter({ 
					model: settings.model, 
					field: settings.field, 
					count: settings.startAt - settings.incrementBy 
				});
				counter.save(() => ready = true);
			} else {
				ready = true;
			}
		}
	);

	// 声明一个函数来获取模型/模式的下一个计数器
	let nextCount = (callback) => {
		IdentityCounter.findOne({
			model: settings.model,
			field: settings.field
		}, (err, counter) => {
			if (err) return callback(err);
			callback(null, counter === null ? settings.startAt : counter.count + settings.incrementBy);
		});
	};
	// 为了方便起见，将nextCount添加为文档上的方法和模式上的静态方法.
	schema.method('nextCount', nextCount);
	schema.static('nextCount', nextCount);

	// 声明一个函数来在起始值处重置计数器——增量值.
	let resetCount = (callback) => {
		IdentityCounter.findOneAndUpdate(
			{ model: settings.model, field: settings.field },
			{ count: settings.startAt - settings.incrementBy },
			{ new: true }, // new: true 指定回调应获取更新后的计数器
			(err) => {
				if (err) return callback(err);
				callback(null, settings.startAt);
			}
		);
	};
	// 为方便起见，将resetCount添加为文档上的方法和模式上的静态方法。
	schema.method('resetCount', resetCount);
	schema.static('resetCount', resetCount);

	// 每次保存此模式中的文档时，运行此逻辑。
	schema.pre('save', function (next) {

		// 只有在它是一个新文档时才这样做 (see http://mongoosejs.com/docs/api.html#document_Document-isNew)
		if (this.isNew) {
			let save = () => {
				// 检查是否已经提供了一个数字，如果该数字大于当前计数，则将计数器更新为该数字
				if (typeof this[settings.field] === 'number') {
					IdentityCounter.findOneAndUpdate(
						// IdentityCounter文档由调用插件的模型和字段标识, 还要检查count是否小于字段值。
						{ model: settings.model, field: settings.field, count: { $lt: this[settings.field] } },
						// 将找到的值的计数更改为新字段值
						{ count: doc[settings.field] },
						(err) => {
							if (err) return next(err);
							// 继续使用默认的文档保存功能
							next();
						}
					);
				} else {
					// 找到这个模型和字段的计数器集合条目并更新它。
					IdentityCounter.findOneAndUpdate(
						// IdentityCounter文档由调用插件的模型和字段标识
						{ model: settings.model, field: settings.field },
						// 通过' incrementBy '增加计数
						{ $inc: { count: settings.incrementBy } },
						// new: true 指定回调应在计数器更新(递增)后获取它。
						{ new: true },
						// 接收更新后的计数器。
						(err, updatedIdentityCounter) => {
							if (err) return next(err);
							// 如果没有错误，则继续将文档的字段设置为当前计数
							this[settings.field] = updatedIdentityCounter.count;
							// 继续使用默认的文档保存功能
							next();
						}
					);
				}
					
			};

			/**
			 * 如果准备好了，运行增量逻辑。
			 * Note: 当找到现有的计数器集合或在第一次创建它之后，ready为true。
			 * 如果没有准备好，然后设置一个5毫秒的计时器，并尝试再次保存。它将一直这样做，直到计数器收集就绪。
			 */
			if (ready) { 
				save();
			} else {
				setTimeout(save, 5);
			}
			return;
		}
		/**
		 * 如果文档中没有我们感兴趣的字段，或者该字段不是一个数字，
		 * 并且用户没有指定我们应该在更新时递增，那么只需继续保存，不使用任何递增逻辑。
		 */
		next();
	});
};

/**
 * 第一个参数是跟 model 对应的集合（ collection ）名字的 单数 形式。 
 * Mongoose 会自动找到名称是 model 名字 复数 形式的 collection
 * 强制使用单数，添加第三个参数
 */
exports.createModel = (model, schema, options = {}) => {
	const { 
		autoIndex = false, 
		autoIncrement = true, 
		field = '_id', 
		startAt = 1, 
		incrementBy = 1
	} = options;

	schema.set('autoIndex', autoIndex);


	/**
	 * _id随机
	 * TODO: 修复测试环境不能使用
	 */
	if (autoIncrement && process.env.NODE_ENV !== 'test') {
		schema.plugin(IncrementPlugin, { 
			model, 
			field, 
			startAt, 
			incrementBy
		});
	}

	return mongoose.model(model, schema, model);
};